import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';

const cpfRegex = /^\d{11}$/;
const cnpjRegex = /^\d{14}$/;

@ValidatorConstraint({ name: 'isCpfOrCnpj', async: false })
class IsCpfOrCnpjConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (typeof text !== 'string') {
      return false;
    }

    text = text.trim();

    if (cpfRegex.test(text)) {
      return this.validateCpf(text);
    }
    if (cnpjRegex.test(text)) {
      return this.validateCnpj(text);
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'The text must be a valid CPF or CNPJ without punctuation';
  }

  private validateCpf(cpf: string): boolean {
    let sum = 0;
    let remainder;

    if (cpf === '00000000000') return false;

    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  private validateCnpj(cnpj: string): boolean {
    if (cnpj === '00000000000000') return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }
}

export function IsCpfOrCnpj() {
  return Validate(IsCpfOrCnpjConstraint);
}
