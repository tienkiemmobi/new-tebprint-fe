import { SummaryInvoicesTable } from './SummaryInvoicesTable';

const data = [
  {
    targetMarket: 'US and others',
    invoices: [
      {
        invoiceNumber: '145',
        period: 'Aug 2022',
        currency: 'USD',
        total: '43003.28',
        flag: 'US',
        region: 'US',
        createdAt: '1h ago',
      },
      {
        invoiceNumber: '146',
        period: 'Aug 2022',
        currency: 'USD',
        total: '43003.28',
        flag: 'US',
        region: 'US',
        createdAt: '1h ago',
      },
      {
        invoiceNumber: '147',
        period: 'Aug 2022',
        currency: 'USD',
        total: '43003.28',
        flag: 'US',
        region: 'US',
        createdAt: '1h ago',
      },
    ],
  },
  {
    targetMarket: 'EU, UK and Norway',
    invoices: [
      {
        invoiceNumber: 'GB2022.133539',
        period: 'Aug 2022',
        currency: 'USD',
        total: '433.28',
        flag: 'GB',
        region: 'US',
        createdAt: '1h ago',
      },
      {
        invoiceNumber: 'GB2022.133538',
        period: 'Aug 2022',
        currency: 'USD',
        total: '432.23',
        flag: 'GB',
        region: 'US',
        createdAt: '1h ago',
      },
      {
        invoiceNumber: 'GB2022.133537',
        period: 'Aug 2022',
        currency: 'USD',
        total: '431.21',
        flag: 'GB',
        region: 'US',
        createdAt: '1h ago',
      },
    ],
  },
  {
    targetMarket: 'Canada',
    invoices: [
      {
        invoiceNumber: 'CA9',
        period: 'Aug 2022',
        currency: 'USD',
        total: '433.28',
        flag: 'CA',
        region: 'US',
        createdAt: '1h ago',
      },
      {
        invoiceNumber: 'CA8',
        period: 'Aug 2022',
        currency: 'USD',
        total: '432.23',
        flag: 'CA',
        region: 'US',
        createdAt: '1h ago',
      },
      {
        invoiceNumber: 'CA7',
        period: 'Aug 2022',
        currency: 'USD',
        total: '431.21',
        flag: 'CA',
        region: 'US',
        createdAt: '1h ago',
      },
    ],
  },
  {
    targetMarket: 'Australia and New Zealand',
    invoices: [],
  },
];

const SummaryInvoices = () => {
  return (
    <div>
      <div className="mt-4 flex lg:mt-8">
        <h2 className="font-bold">Summary Invoices</h2>
      </div>
      <p className="my-2 text-sm text-[#686F71]">
        Summary invoices are monthly reports that include all invoices made within the given month. You can choose the
        frequency and format of your invoices by switching between <i>Summary</i> and <i>Per order invoicing</i> from{' '}
        <u>the Settings page</u>.
      </p>
      {data.map((item) => {
        return (
          <div key={item.targetMarket}>
            <SummaryInvoicesTable key={item.targetMarket} market={item.targetMarket} invoices={item.invoices} />
          </div>
        );
      })}
    </div>
  );
};

export { SummaryInvoices };
