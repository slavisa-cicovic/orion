import FormField, { FormFieldProps } from "@src/components/ui/form-field";

type AuthFieldProps = FormFieldProps;

export default function AuthField(props: AuthFieldProps) {
  return <FormField {...props} />;
}
