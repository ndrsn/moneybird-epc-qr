# moneybird-epc-qr
Chrome extension for inserting an EPC QR code into the Moneybird invoice page. 

The extension uses a Moneybird API token (set in `Options`) to retrieve complete invoice and contact details from the Moneybird API, and constructs a string which is used to encode as a QR code.

The format of this string is specified in the [EPC QR specification](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines-enable-data-capture-initiation).

Users can scan this QR code using their mobile banking app to avoid manual re-entry of invoice details (and thus reduce errors) when transferring funds.

![Example of an inserted EPC QR code](https://github.com/ndrsn/moneybird-epc-qr/raw/master/screenshot.png?raw=true)