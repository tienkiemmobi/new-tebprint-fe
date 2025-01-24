import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui';

import { PaymentDetail } from './PaymentDetail';
import { PerOrderInvoices } from './PerOrderInvoices';
import { SummaryInvoices } from './SummaryInvoices';
import { Transactions } from './Transactions';

const balance = 500.02;
const Payments = () => {
  const [tabPayments, setTabPayments] = useState('payment-detail');
  const [loadingTabPayments, setLoadingTabPayments] = useState(false);
  const paymentTabs = [
    { value: 'payment-detail', label: 'Payment Detail' },
    { value: 'transactions', label: 'Transactions' },
    { value: 'summary-invoices', label: 'Summary invoices' },
    { value: 'per-order-invoices', label: 'Per order invoices' },
  ];
  useEffect(() => {
    const currentURL = window.location.href;
    const url = new URL(currentURL);

    const action = url.searchParams.get('action');

    if (action === 'transactions') {
      setTabPayments('transactions');
    }
    setLoadingTabPayments(true);
  }, []);
  useEffect(() => {
    if (!loadingTabPayments) {
      return;
    }
    if (tabPayments === 'transactions') {
      return;
    }
    window.history.replaceState('', '', `?action=${tabPayments}`);
  }, [tabPayments]);

  return (
    <div className="w-full p-4">
      <div className="flex rounded-[5px] border bg-white px-6 py-4 shadow-md">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Payments</h2>
      </div>
      <div className="mt-6 rounded-sm border bg-white shadow-md">
        <div className="p-6">
          <Tabs
            defaultValue={tabPayments}
            value={tabPayments}
            onValueChange={(value) => {
              setTabPayments(value);
            }}
            className="relative overflow-x-auto"
          >
            <TabsList className="no-scrollbar mb-0 w-full overflow-y-hidden bg-background pb-3">
              {paymentTabs.map((tabs) => (
                <TabsTrigger className="w-fit" value={tabs.value} key={tabs.value}>
                  {tabs.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="payment-detail">
              <PaymentDetail balance={balance} />
            </TabsContent>
            <TabsContent value="transactions">
              <Transactions />
            </TabsContent>
            <TabsContent value="summary-invoices">
              <SummaryInvoices />
            </TabsContent>
            <TabsContent value="per-order-invoices">
              <PerOrderInvoices />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export { Payments };
