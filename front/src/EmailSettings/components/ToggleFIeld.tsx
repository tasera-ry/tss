import { useLingui } from "@lingui/react/macro";
import { FormControl, FormLabel, FormControlLabel, FormHelperText, Switch } from "@mui/material";
import { UseFormReturn, Controller } from "react-hook-form";

interface ToggleFieldProps {
  label: string;
  field: string;
  form: UseFormReturn<any>;
  helperText?: string;
}

export function ToggleField({ label, field, form, helperText }: ToggleFieldProps) {
  const { t } = useLingui();
  return (
    <FormControl component="fieldset">
      <FormLabel className='text-sm!'>{label}</FormLabel>
      <Controller
        name={field}
        control={form.control}
        render={({ field: { onChange, value, ref } }) => (
          <FormControlLabel
            control={
              <Switch
                checked={value === 'true'}
                onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
                inputRef={ref}
                color="primary"
              />
            }
            label={value === 'true' ? t`Yes` : t`No`}
          />
        )}
      />
      {helperText && (
        <FormHelperText className="helperText">
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  )
}
