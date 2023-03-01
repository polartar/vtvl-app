const numberRegex = /^\d+$/;
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

export type Validation = 'required' | 'address' | 'email' | 'number';

export type ValidationResponse = {
  validated: boolean;
  message?: string;
};

export function validateRequired(value: string): ValidationResponse {
  if (String(value) !== '') {
    return {
      validated: true
    };
  }
  return {
    validated: false,
    message: 'This is a required field.'
  };
}

export function validateEmail(value: string): ValidationResponse {
  if (String(value).toLowerCase().match(emailRegex)) {
    return {
      validated: true
    };
  }
  return {
    validated: false,
    message: 'This email is invalid.'
  };
}

export function validateNumber(value: string): ValidationResponse {
  if (value.match(numberRegex)) {
    return {
      validated: true
    };
  }

  return {
    validated: false,
    message: 'This number is invalid.'
  };
}

export function validateAddress(value: string): ValidationResponse {
  if (value.match(addressRegex)) {
    return {
      validated: true
    };
  }

  return {
    validated: false,
    message: 'This address is invalid.'
  };
}

export const validators = {
  required: validateRequired,
  email: validateEmail,
  number: validateNumber,
  address: validateAddress
};

export function validate(value: string, validations: Validation[]): ValidationResponse[] {
  const errors = [];

  for (const validation of validations) {
    const error = validators[validation](value);
    if (!error.validated) {
      errors.push(error);
    }
  }

  return errors;
}
