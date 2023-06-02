import React, { useCallback } from "react";

import {
    Box,
    IconButton,
    TextField as MuiTextField,
    useTheme
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import ClearIcon from "@mui/icons-material/Clear";

import { FieldProps } from "../../types";

import { FieldDescription, LabelWithIcon } from "../components";
import { useClearRestoreValue } from "../../hooks";
import { getIconForProperty } from "../../core";
import {
    fieldBackground,
    fieldBackgroundHover
} from "../../core/util/field_colors";

type DateTimeFieldProps = FieldProps<Date>;

/**
 * Field that allows selecting a date
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function DateTimeFieldBinding({
                                         propertyKey,
                                         value,
                                         setValue,
                                         autoFocus,
                                         error,
                                         showError,
                                         disabled,
                                         touched,
                                         property,
                                         includeDescription
                                     }: DateTimeFieldProps) {

    const internalValue = value || null;

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleClearClick = useCallback(() => {
        setValue(null);
    }, [setValue]);

    const PickerComponent = property.mode === undefined || property.mode === "date_time"
        ? DateTimePicker
        : DatePicker;

    const theme = useTheme();

    return (
        <>

            <PickerComponent
                autoFocus={autoFocus}
                value={internalValue}
                renderInput={(params) =>
                    (
                        <MuiTextField {...params}
                                      fullWidth
                                      className={`min-h-[64px] rounded-[${theme.shape.borderRadius}px] ${fieldBackground(
                                          theme
                                      )} hover:${fieldBackgroundHover(theme)}`}
                                      label={
                                          <LabelWithIcon
                                              icon={getIconForProperty(property)}
                                              required={property.validation?.required}
                                              title={property.name}/>
                                      }
                                      InputProps={{
                                          ...params.InputProps,
                                          sx: (theme) => ({
                                              minHeight: "64px",
                                              borderRadius: `${theme.shape.borderRadius}px`,
                                              backgroundColor: fieldBackground(theme),
                                              "&:hover": {
                                                  backgroundColor: fieldBackgroundHover(theme)
                                              }
                                          }),
                                          disableUnderline: true,
                                          endAdornment: <Box
                                              className="pr-2 space-x-2">
                                              {property.clearable && <IconButton
                                                  className="absolute right-14 top-3"
                                                  onClick={handleClearClick}>
                                                  <ClearIcon/>
                                              </IconButton>}
                                              {params.InputProps?.endAdornment}
                                          </Box>
                                      }}
                                      error={showError}
                                      variant={"filled"}
                                      helperText={showError ? error : null}/>
                    )}
                disabled={disabled}
                onChange={(dateValue) => setValue(dateValue)}
            />

            {includeDescription &&
                <FieldDescription property={property}/>}

        </>
    );
}
