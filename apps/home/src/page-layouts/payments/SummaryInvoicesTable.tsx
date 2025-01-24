import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Flag } from 'ui';

import type { Invoice } from '@/interfaces';

type SummaryInvoicesTableProps = {
  className?: string;
  invoices?: Invoice[];
  market?: string;
};

const SummaryInvoicesTable = (props: SummaryInvoicesTableProps) => {
  const { invoices, market = 'Market' } = props;

  return (
    <div className="py-8">
      <label className="mt-4 py-2 text-xl font-bold">{market}</label>
      {invoices?.length ? (
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <table className="dsy-table dsy-table-zebra mt-4 overflow-x-auto text-base">
            <thead>
              <tr>
                <th>Invoice number</th>
                <th>Period</th>
                <th className="text-end">Total</th>
                <th>{''}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                return (
                  <tr key={invoice.invoiceNumber}>
                    <td className="flex items-center">
                      {invoice.flag ? <Flag code={`${invoice.flag}`} /> : ''}
                      {invoice.invoiceNumber}
                    </td>
                    <td>{invoice.period}</td>
                    <td className="text-end">
                      {invoice.currency} {invoice.total}
                    </td>
                    <td>
                      <a href={'/files/invoices_example.pdf'} download={'invoices_example.pdf'}>
                        <FontAwesomeIcon icon={faDownload} size="sm" className="text-primary" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tbody></tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 lg:py-16">
          <img src="/assets/empty.svg" alt="Empty" />
          <p className="mt-2 font-bold">No invoices yet</p>
        </div>
      )}
    </div>
  );
};

export { SummaryInvoicesTable };
