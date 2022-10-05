import { NextPage } from "next";
import { Breadcrumb } from "../components/global/Breadcrumb";
import { Radio } from "../components/global/Radio";
import { Input } from "../components/global/Input";
import { BackButton } from "../components/global/BackButton";
import { useState } from "react";

const crumbSteps = [
  { title: "Dashboard", route: "dashboard" },
  { title: "Vesting summary", route: "vesting-summary" },
];

const ConfirmationImportedSafesPage: NextPage = () => {
  const [importedSafes, setImportedSafes] = useState({
    type: "gnosis-safe",
  });

  const radioHandler = (e: any) => {
    setImportedSafes({ ...importedSafes, type: e.target.value });
  };

  // // Automatically add new key when adding a member
  // const getMemberKey = () => {
  //   return memberCount++;
  // };

  // // Add member function
  // const addMember = () => {
  //   const membersControl = confirmationForm.get('members') as FormArray;
  //   membersControl.push(createMember());
  // };

  // // Create a member form control
  // const createMember = (): FormGroup => {
  //   const control = FormBuilder.group({
  //     name: ['', Validators.required],
  //     address: ['', Validators.required]
  //   });
  //   // Adding key
  //   control.meta = {
  //     key: getMemberKey()
  //   };
  //   return control;
  // };

  return (
    <>
      <div className="w-full text-left mb-5">
        <Breadcrumb steps={crumbSteps} />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 max-w-3xl">
        <h1 className="text-neutral-900">Confirmation</h1>
        <div className="w-full my-6 panel">
          <div className="grid md:grid-cols-2 py-5 gap-5 border-b border-neutral-200">
            <div>
              <label>
                <span>Schedule</span>
              </label>
              <div className="inline-flex items-center px-6 py-3 h-13 border border-primary-900 rounded-3xl">
                VOYAGER 0123
              </div>
            </div>
            <div>
              <label>
                <span>Vesting Contract</span>
              </label>
              <div className="inline-flex items-center px-0 py-3 h-13 text-primary-900 font-medium text-lg">
                0x4657....cBA61efb0a263
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 py-5 gap-5 border-b border-neutral-200">
            <Radio
              label="Gnosis safe"
              name="type"
              value="gnosis-safe"
              variant="input-style"
              checked={importedSafes.type === "gnosis-safe"}
              onChange={radioHandler}
            />
            <Radio
              label="Individual"
              name="type"
              value="individual"
              variant="input-style"
              checked={importedSafes.type === "individual"}
              onChange={radioHandler}
            />
          </div>
          <h2 className="h5 font-semibold text-neutral-900 mt-5">Your safes</h2>
          <p className="text-sm text-neutral-500 mb-5">
            You can natively create new, import or login to your existing gnisis
            safe multisig.
          </p>
          {/* Dynamic safes */}
          <div className="grid md:grid-cols-3 pb-5 gap-5 border-b border-neutral-200">
            <Input
              label="Organization name"
              required
              placeholder="Enter your organization name"
              className="md:col-span-3"
            />
            <Input label="Owner name" required placeholder="Enter owner name" />
            <Input
              label="Owner address"
              required
              placeholder="Enter owner address"
              className="md:col-span-2"
            />
            <div className="md:col-span-3">
              <button className="secondary small">+ Add more</button>
            </div>
            <Input
              label="How many people should authorize this transaction?"
              required
              placeholder="1"
              className="md:col-span-3"
            />
          </div>
          <div className="flex flex-row justify-between items-center mt-6">
            <BackButton label="Return to summary" href="/" />
            <button className="flex flex-row items-center gap-2 primary">
              Sign and Authorize{" "}
              <img
                src="/icons/arrow-small-left.svg"
                alt="Sign and Authorize"
                className="rotate-180 fill-current text-white"
              />
            </button>
          </div>
        </div>
        {/* </form>
        )} /> */}
      </div>
    </>
  );
};

export default ConfirmationImportedSafesPage;
