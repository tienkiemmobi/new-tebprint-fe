import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PaymentDetailIcon, PayoneerButton, PayPalButton, VisaIcon } from 'ui';

type PaymentDetailProps = {
  balance: number;
};
const PaymentDetail = (props: PaymentDetailProps) => {
  const { balance } = props;

  return (
    <div className="lg:grid lg:grid-cols-3 lg:gap-4">
      <div className="col-span-1 hidden p-4 lg:block">
        <PaymentDetailIcon />
      </div>

      <div className="col-span-2 m-2">
        <form>
          {/* Card and Balance */}
          <div className="py-2">
            <h6 className="py-2 text-xl font-bold">Tebprint Balance</h6>
            <p className="py-1 text-base text-slate-500"> No-hassle way to easily cover order and production costs</p>
            <p className="py-1 text-base text-slate-500"> Faster order processing without the need for card payments</p>
            <p className="py-1 text-base text-slate-500"> Avoid extra transaction and conversion fees</p>
          </div>
          <div className="dsy-card dsy-card-side bg-[#CA8C08] text-white shadow-xl">
            <div className="dsy-card-body">
              {/* current balance */}
              <div className="md:py-2">
                <p>Current balance</p>
                <h2 className="dsy-card-title text-2xl">{balance}</h2>
              </div>

              {/* top up amount */}
              <div className="md:py-2">
                <p>Top up amount</p>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-500">
                    USD
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    id="website-admin"
                    className="block w-full min-w-0 flex-1 border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Pay with */}
              <div className="md:py-2">
                <p>Pay with:</p>
                <div className="grid grid-cols-2 gap-2">
                  <PayPalButton className="bg-teb p-4 hover:bg-teb/90" />
                  <PayoneerButton className="bg-teb p-4 hover:bg-teb/90" />
                </div>
              </div>
            </div>
            <figure className="!hidden flex-col flex-nowrap bg-teb font-normal md:!flex md:p-16">
              <img src="/assets/LOGO.png" alt="Album" />
              TEB PRINT
            </figure>
          </div>

          {/* Payment card */}
          <div className="mt-10">
            <h6 className="py-2 text-xl font-bold">Payment card</h6>
            <p className="py-1 text-base text-slate-500">
              Add a credit/debit card for use when there are not enough funds in your Tebprint balance.
            </p>

            <div className="mx-auto flex w-full flex-col items-start justify-between gap-2 p-6 shadow-md ssm:flex-row ssm:items-center ssm:gap-0">
              <div className="flex items-center">
                <VisaIcon />
                <div>
                  <div className="ml-2">{'•••• •••• •••• 9509'}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div>{'11/2023'}</div>
                <button>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>

          {/* Billing currency */}
          <div className="mt-10">
            <h6 className="py-2 text-xl font-bold">Billing currency</h6>
            <p className="py-1 text-base text-slate-500">The currency you wish to use for billing and invoicing.</p>

            <div className="mx-auto flex w-full items-center justify-between p-4 shadow-md">
              <div className="flex items-center font-bold">USD</div>
              <div className="flex items-center space-x-2">
                <button className="border-2 px-6 py-2 font-bold">Change</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export { PaymentDetail };
