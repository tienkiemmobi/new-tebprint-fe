import { Checkbox, Label, RadioGroup, RadioGroupItem, SettingsPageIcon } from 'ui';

const Settings = () => {
  const systemUnits = [
    { type: 'metric', label: 'Use metric system (kg, cm, etc.)' },
    { type: 'imperial', label: 'Use imperial system (pounds, inches, etc.)' },
  ];

  return (
    <div className="w-full p-4">
      <div className="block rounded-[5px] border bg-white px-6 py-4 shadow-md md:flex">
        <h2 className="mr-8 flex-1 text-3xl font-bold leading-10 tracking-tighter">Settings</h2>
      </div>
      <div className="mt-6 flex h-auto w-full border-2 bg-background p-2">
        <div className="hidden p-4 md:block">
          <SettingsPageIcon />
        </div>

        <div>
          <form>
            {/* Time and format */}
            <div className="py-2">
              <h6 className="py-2 text-xl font-bold">Standards and formats</h6>
              <p className="py-2 text-sm">These settings will apply globally to your Tebprint account and products</p>
              <RadioGroup defaultValue="option-one">
                {systemUnits.map((systemUnit) => {
                  return (
                    <div key={systemUnit.type} className="flex items-center space-x-2 py-1">
                      <RadioGroupItem value={systemUnit.type} id="option-one" />
                      <Label>{systemUnit.label}</Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
            {/* Email notification */}
            <div className="py-2">
              <h6 className="py-2 text-xl font-bold">Email Notifications</h6>
              <p className="pb-4 pt-2 text-sm">Will be sent to your contact email {'tuxd92@gmail.com'}</p>
              <Checkbox id="terms" />
              <label
                htmlFor="notification"
                className="ml-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Product launch announcements, updates and tutorials
              </label>
            </div>
            {/* Login settings */}
          </form>
        </div>
      </div>
    </div>
  );
};

export { Settings };
