function getEpcQrString({
  bicOfBenificiaryBank,
  benificiaryName,
  benificiaryAccountNumberIban,
  currencyAndAmount,
  remittanceInformation,
}) {
  /*
  An EPC QR code is a line-separated set of elements,
  detailing a payment request, and is described in EPC069-12.

  These first four elements are (for our purposes) static; only
  the next five are actually variable. I'm leaving "purpose of
  transfer" (which is a 4-letter standardized code) empty because
  an invoice can be either for goods or services (or both) and
  there's no way to deduce this from the information provided
  to us by Moneybird.
  */

  const serviceTag = 'BCD';
  const qrVersion = '002';
  const characterSet = '1';
  const identificationCode = 'SCT';

  const data = [
    serviceTag,
    qrVersion,
    characterSet,
    identificationCode,
    bicOfBenificiaryBank,
    benificiaryName,
    benificiaryAccountNumberIban,
    currencyAndAmount, // e.g., EUR25.00
    '', // Purpose of transfer (optional AT-44 code)
    remittanceInformation, // the description
  ].join('\n');

  return data;
}

function insertQrCodeDiv(imageUrl) {
  const qrCodeDiv = document.createElement('div');
  qrCodeDiv.setAttribute('class', 'epc-qr-code');

  const qrCodeImage = document.createElement('img');
  qrCodeImage.setAttribute('src', imageUrl);

  qrCodeDiv.insertBefore(qrCodeImage, null);

  const elementHistoryAside = document.querySelector('aside.element-history');

  if (!elementHistoryAside) return;

  const documentHistoryDiv = document.querySelector(
    '.document-history-summary'
  );

  if (!documentHistoryDiv) return;

  elementHistoryAside.insertBefore(qrCodeDiv, documentHistoryDiv);
}

const isOnInvoicePage = () =>
  window.location.pathname.match(/^\/\d+\/documents\/\d+$/) !== null;

async function run() {
  if (!window.QRCode) {
    console.error('QRCode unavailable');
    return;
  }

  if (isOnInvoicePage() === false) return;

  const getAdministrationApiKey = administrationId => {
    const promise = new Promise((resolve, reject) => {
      chrome.storage.sync.get(['moneybirdApiKeys'], function({
        moneybirdApiKeys,
      }) {
        try {
          const lines = moneybirdApiKeys.split('\n');
          const pairs = new Map(
            lines.map(line => line.replace(/\s+/g, '').split(':'))
          );

          if (pairs.has(administrationId)) {
            const apiToken = pairs.get(administrationId);

            resolve(apiToken);
          }

          resolve(null);
        } catch (error) {
          console.error(error);
          resolve(null);
        }
      });
    });

    return promise;
  };

  const [administrationId, , documentId] = window.location.pathname
    .split('/')
    .slice(1);

  const moneybirdApiVersion = 'v2';
  const moneybirdApiKey = await getAdministrationApiKey(administrationId);

  if (!moneybirdApiKey) {
    console.warn(
      `Moneybird API key unavailable for administration ${administrationId}`
    );
    return;
  }

  const response = await fetch(
    `https://moneybird.com/api/${moneybirdApiVersion}/${administrationId}/documents/purchase_invoices/${documentId}`,
    {
      headers: {
        Authorization: `Bearer ${moneybirdApiKey}`,
      },
    }
  );

  if (!response.ok) {
    console.error('Invalid Moneybird API response', response);
    return;
  }

  const document = await response.json();

  if (document.state === 'paid') return;

  const benificiaryAccountNumberIban = document.contact.sepa_iban;
  const bicOfBenificiaryBank = document.contact.sepa_bic;
  const benificiaryName =
    document.contact.sepa_iban_account_name || document.contact.company_name;

  const { currency = 'EUR', total_price_incl_tax_base: total } = document;
  const currencyAndAmount = `${currency}${total}`;
  const remittanceInformation = `Invoice ${document.reference}`;

  const dataString = getEpcQrString({
    bicOfBenificiaryBank,
    benificiaryName,
    benificiaryAccountNumberIban,
    currencyAndAmount,
    remittanceInformation,
  });

  const dataUrl = await window.QRCode.toDataURL(dataString);

  insertQrCodeDiv(dataUrl);
}

window.onload = run;

document.addEventListener('DOMContentLoaded', () => {
  const callback = (...args) => {
    console.log('changes', args);
    // run();
  };

  const observer = new MutationObserver(callback);

  console.log('observing');

  const config = {
    childList: true,
    subtree: true,
    attributes: false,
  };

  setTimeout(() => {
    observer.observe(document.body, config);

    run();
  }, 1e3);
});
