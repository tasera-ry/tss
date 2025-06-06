import { useLingui } from '@lingui/react/macro';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export function SelectAssociation({ form, associationList }) {
  const { t } = useLingui();
  if (form.watch('role') !== 'rangeofficer') return null;

  return (
    <FormControl>
      <InputLabel id="association-select-label">{t`Select association`}</InputLabel>
      <Select
        id="associationSelect"
        labelId="association-select-label"
        label={t`Select association`}
        value={form.watch('associationId') || ''}
        onChange={(e) => form.setValue('associationId', e.target.value)}
      >
        {associationList.map((association) => {
          return (
            <MenuItem key={association.id} value={association.id}>
              {association.name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
