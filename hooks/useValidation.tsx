import { useEffect, useState } from 'react';

export type FormValidation = 'required' | 'address' | 'email' | 'number';

export function useValidation<T extends string>(initialValue: T, validations: FormValidation[]) {}
