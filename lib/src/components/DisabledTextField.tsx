import React from "react";
import Typography from "./Typography";
import { InputLabel } from "./InputLabel";

export function DisabledTextField<T extends string | number>({
                                                                 label,
                                                                 size,
                                                                 value
                                                             }: {
    label: React.ReactNode,
    size?: "small" | "medium"
    value: T
}) {

    return <div
        className={`relative bg-field-disabled dark:bg-field-disabled-dark rounded-md w-full ${size === "small" ? "h-12" : "h-16"}`}>
        <InputLabel
            shrink={Boolean(value)}
            className="">{label}</InputLabel>
        <div
            className={`p-8 overflow-auto ${label ? "pt-8 pb-2" : size === "small" ? "p-3" : "px-3"}`}>
            <Typography variant={"body1"}
                        className="font-inherit">{value}</Typography>
        </div>
    </div>;
}
