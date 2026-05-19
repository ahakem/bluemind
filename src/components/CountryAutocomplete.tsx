'use client';

import { Autocomplete, Box, TextField } from '@mui/material';
import { countries, CountryType } from '@/data/countries';

interface Props {
  /** If provided, only these country labels are offered as options (e.g. countries that have sites). Pass undefined to show all 248. */
  limitToLabels?: string[];
  value: CountryType | null;
  onChange: (country: CountryType | null) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: object;
}

export default function CountryAutocomplete({
  limitToLabels,
  value,
  onChange,
  label = 'Country',
  placeholder = 'Choose a country',
  size = 'small',
  fullWidth,
  sx,
}: Props) {
  const options = limitToLabels
    ? countries.filter((c) => limitToLabels.includes(c.label))
    : countries;

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, val) => onChange(val)}
      autoHighlight
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, val) => option.code === val.code}
      size={size}
      fullWidth={fullWidth}
      sx={sx}
      renderOption={(props, option) => {
        const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: React.Key };
        return (
          <Box
            key={key}
            component="li"
            sx={{ '& > img': { mr: 1.5, flexShrink: 0 } }}
            {...rest}
          >
            <img
              loading="lazy"
              width="20"
              srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
              src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
              alt=""
            />
            {option.label}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              autoComplete: 'new-password',
            },
          }}
        />
      )}
    />
  );
}
