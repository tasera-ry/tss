import { useLingui } from '@lingui/react/macro';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export function SelectRole({ form }) {
  const { t } = useLingui();

  const value = form.watch('role');

  if (!['rangeofficer', 'association', 'superuser'].includes(value))
    return null;

  return (
    <FormControl>
      <InputLabel id="role-select-label">{t`Select role`}</InputLabel>
      <Select
        id="role"
        labelId="role-select-label"
        label={t`Select role`}
        {...form.register('role')}
        value={form.watch('role')}
        onChange={(e) => form.setValue('role', e.target.value)}
      >
        <MenuItem value="rangeofficer">{t`Range officer`}</MenuItem>
        <MenuItem value="association">{t`Association`}</MenuItem>
        <MenuItem value="superuser">{t`Superuser`}</MenuItem>
      </Select>
    </FormControl>
  );
}
