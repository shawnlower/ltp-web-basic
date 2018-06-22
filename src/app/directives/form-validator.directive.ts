import { Directive } from '@angular/core';

import { AbstractControl, FormControl, Validator, ValidatorFn, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appFormValidator]'
})
export class FormValidatorDirective {

  constructor() { }

}

export function jsonValidator(control: AbstractControl): ValidationErrors {
  try {
    JSON.parse(control.value);
  } catch (e) {
    return { jsonValidationError: e };
  }
  return null;
}

