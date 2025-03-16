import { FormLabel, TextField, FormHelperText } from "@mui/material";
import classNames from "classnames";
import { ReactNode, useState } from "react";
import { UseFormReturn, Controller } from "react-hook-form";

interface CollapsibleTextFieldProps {
  label: string;
  field: string;
  form: UseFormReturn<any>;
  helperText?: ReactNode;
}

export function CollapsibleTextField({ label, field, form, helperText }: CollapsibleTextFieldProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="border border-gray-300 rounded-md p-2">
      <div 
        onClick={toggleExpanded}
        className="flex items-center justify-between border-b border-gray-300 py-2"
      >
        <FormLabel className="">{label}</FormLabel>
        <span
          className={classNames(
            "transition-transform duration-300 text-light-grey",
            expanded ? "" : "rotate-180"
          )}
        >
          ▲
        </span>
      </div>
      
      {expanded && (
        <>
          <Controller
            name={field}
            control={form.control}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                value={value}
                onChange={onChange}
                inputRef={ref}
                margin="normal"
                variant="outlined"
                error={!!form.formState.errors[field]}
                helperText={form.formState.errors[field]?.message.toString()}
              />
            )}
          />
          {helperText && (
            <FormHelperText className="helperText whitespace-break-spaces">
              {helperText}
            </FormHelperText>
          )}
        </>
      )}
    </div>
  );
}
