# moneybird-epc-qr
Chrome extension for inserting an EPC QR code into the Moneybird invoice page. 

The extension uses a Moneybird API token (set in `Options`) to retrieve complete invoice and contact details from the Moneybird API, and constructs a string which is used to encode as a QR code.

The format of this string is specified in the [EPC QR specification](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation).

Users can scan this QR code using their mobile banking app to avoid manual re-entry of invoice details (and thus reduce errors) when transferring funds.

## Note

Due to the way Moneybird loads pages (fetching via XHR instead of a full page reload), the QR is not loaded when navigating to an invoice page. Refreshing the page manually (see that browser refresh button? Click it!) will cause the extension to correctly parse the invoice page details and render the QR code. An unfortunate piece of manual labor, but I've not found the time yet to detect Moneybird page transitions.

![Example of an inserted EPC QR code](https://github.com/ndrsn/moneybird-epc-qr/raw/master/screenshot.png?raw=true)
