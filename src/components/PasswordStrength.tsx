import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password_string: string;
}

const Requirement = ({ met, text }: { met: boolean; text: string }) => (
  <li className={`flex items-center gap-2 text-sm transition-colors ${met ? 'text-green-600' : 'text-gray-500'}`}>
    {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
    <span>{text}</span>
  </li>
);

export function PasswordStrength({ password_string }: PasswordStrengthProps) {
  // Validations
  const has_length = password_string.length >= 10;
  const has_uppercase = /[A-Z]/.test(password_string);
  const has_number = /[0-9]/.test(password_string);
  const has_symbol = /[^A-Za-z0-9]/.test(password_string);

  return (
    <ul className="space-y-1 mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
      <Requirement met={has_length} text="Mínimo 10 caracteres" />
      <Requirement met={has_uppercase} text="Al menos una mayúscula" />
      <Requirement met={has_number} text="Al menos un número" />
      <Requirement met={has_symbol} text="Al menos un símbolo" />
    </ul>
  );
}