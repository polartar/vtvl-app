import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { NextPage } from "next";
import { Avatar } from "../../components/global/Avatar";
import { Radio } from "../../components/global/Radio";
import { Input } from "../../components/global/Input";
import { BackButton } from "../../components/global/BackButton";

enum userType {
  individual = "individual",
  organization = "organization",
}

interface Contributor {
  name: string;
  email: string;
}

type AccountForm = {
  name: string;
  type: userType;
  company: string;
  companyEmail: string;
  contributors?: Contributor[];
};

const AccountSetupPage: NextPage = () => {
  // Get to use the react-hook-form and set default values
  const {
    control,
    register,
    handleSubmit,
    watch,
    getFieldState,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      company: "",
      companyEmail: "",
      type: "organization",
      contributors: [
        {
          name: "",
          email: "",
        },
      ],
    },
  });

  // Watch for these fields -- will later on be used to determine the checked state of the radio and other state checks
  const userTypeRadio = { value: watch("type"), state: getFieldState("type") };
  const userName = { value: watch("name"), state: getFieldState("name") };
  const userCompany = {
    value: watch("company"),
    state: getFieldState("company"),
  };
  const userCompanyEmail = {
    value: watch("companyEmail"),
    state: getFieldState("companyEmail"),
  };

  console.log("Values", userTypeRadio, userName, userCompany, userCompanyEmail);

  const onSubmit: SubmitHandler<AccountForm> = (data) =>
    console.log("Form Submitted", data);

  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-2xl">
      <h1 className="text-neutral-900">Setup your account</h1>
      <p className="text-sm max-w-xl text-center text-neutral-500">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae
        iaculis nulla. Etiam eget rhoncus orci, ac vestibulum justo.
      </p>
      <div className="w-full my-6 panel">
        <div className="flex flex-row items-center gap-3.5 pb-5 border-b border-neutral-200">
          <Avatar
            name={userName.value || "Your name"}
            size="large"
            placeholder="initials"
          />
          <div>
            <h2 className="h6 text-neutral-900">
              {userName.value || "Your name"}
            </h2>
            <p className="text-sm text-neutral-500">
              {userCompany.value || "Company name"}
            </p>
            {/* <p className="text-sm text-neutral-600">
              0x123126386ajdkhf8123923123laj
            </p> */}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 py-5 gap-5 border-b border-neutral-200">
            <Controller
              name="type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Radio
                  label="Organization"
                  variant="input-style"
                  checked={userTypeRadio.value === "organization"}
                  {...field}
                  value="organization"
                />
              )}
            />
            <Controller
              name="type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Radio
                  label="Individual"
                  variant="input-style"
                  {...field}
                  checked={userTypeRadio.value === "individual"}
                  value="individual"
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Your name"
                  placeholder="Enter your name"
                  error={Boolean(errors.name)}
                  message={errors.name && "Please enter your name"}
                  {...field}
                />
              )}
            />

            <Controller
              name="company"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Company name"
                  placeholder="Enter your company name"
                  error={Boolean(errors.company)}
                  message={errors.company && "Please enter your company name"}
                  {...field}
                />
              )}
            />

            <Controller
              name="companyEmail"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  label="Your company email"
                  placeholder="Enter your company email address"
                  className="md:col-span-2"
                  error={Boolean(errors.companyEmail)}
                  success={
                    !Boolean(errors.companyEmail) &&
                    userCompanyEmail.state.isTouched
                  }
                  message={
                    errors.companyEmail
                      ? "Please enter your company email"
                      : userCompanyEmail.state.isTouched
                      ? "Company email is valid"
                      : ""
                  }
                  {...field}
                />
              )}
            />
          </div>
          <div className="grid md:grid-cols-2 py-5 gap-5">
            <Input
              label="Contributor's name"
              placeholder="Enter contributor's name"
              required
            />
            <Input
              label="Contributor's email"
              placeholder="Enter contributor's email address"
              required
            />
          </div>
          <button className="secondary small mb-5">
            Add more contributors
          </button>
          <div className="flex flex-row justify-between items-center">
            <BackButton label="Return" href="/onboarding/select-user-type" />
            <button className="primary" type="submit">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSetupPage;
