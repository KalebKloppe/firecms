import React, { useDeferredValue, useEffect, useRef } from "react";
import clsx from "clsx";

import { styled } from "@mui/material/styles";

import { FormHelperText } from "@mui/material";

// @ts-ignore
import MarkdownIt from "markdown-it";
import MdEditor, { Plugins } from "react-markdown-editor-lite";

import { LabelWithIcon } from "../components";
import { FieldProps } from "../../types";
import { getIconForProperty } from "../../core";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin } from "../../styles";
import { FieldHelperText } from "../components/FieldHelperText";

const mdParser = new MarkdownIt();
MdEditor.use(Plugins.AutoResize, {
    min: 100
})
MdEditor.unuse(Plugins.FontUnderline)
MdEditor.unuse(Plugins.Clear);

/**
 * Render a markdown field that allows edition and seeing the preview.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function MarkdownFieldBinding({
                                         propertyKey,
                                         value,
                                         setValue,
                                         error,
                                         showError,
                                         disabled,
                                         autoFocus,
                                         touched,
                                         property,
                                         tableMode,
                                         includeDescription,
                                         context
                                     }: FieldProps<string>) {

    const [internalValue, setInternalValue] = React.useState(value);
    const valueRef = useRef(value);

    const deferred = useDeferredValue({
        internalValue,
        value
    });

    useEffect(() => {
        valueRef.current = value;
        setInternalValue(value);
    }, [value]);

    useEffect(() => {
        if (deferred.internalValue !== valueRef.current)
            setValue(deferred.internalValue);
    }, [deferred]);

    return (
        <StyledFormControl>

            {!tableMode && <FormHelperText filled>
                <LabelWithIcon icon={getIconForProperty(property)}
                               required={property.validation?.required}
                               title={property.name}
                               className={"ml-3.5"}/>
            </FormHelperText>}

            <MdEditor value={internalValue ?? ""}
                      className={clsx(fieldBackgroundMixin,
                          disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                          "text-base")}
                      readOnly={disabled}
                      renderHTML={text => mdParser.render(text)}
                      view={{
                          menu: true,
                          md: true,
                          html: false
                      }}
                      onChange={({
                                     html,
                                     text
                                 }) => {
                          setInternalValue(text ?? null);
                      }}/>

            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>

        </StyledFormControl>
    );

}

const StyledFormControl = styled("div")(() => (`
  @font-face {
    font-family: rmel-iconfont;
    src: url(data:application/vnd.ms-fontobject;base64,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NS4BJyMOAd0VGwEBGxWRFRsbFWEcFBQcYRUbGxWRFRsBARsCK2EVGxsVkRUbAQEbKRySARsVYRwpGwEBGxWRFRsBHwEbFZEVGwEBGykcYRUbwwEbFWEcKRsBARsVkRUb/qscKRsBARsVkRUbGxUBtRQcYRUbGxWRFRsBARsAAAAAAAASAN4AAQAAAAAAAAAVAAAAAQAAAAAAAQANABUAAQAAAAAAAgAHACIAAQAAAAAAAwANACkAAQAAAAAABAANADYAAQAAAAAABQALAEMAAQAAAAAABgANAE4AAQAAAAAACgArAFsAAQAAAAAACwATAIYAAwABBAkAAAAqAJkAAwABBAkAAQAaAMMAAwABBAkAAgAOAN0AAwABBAkAAwAaAOsAAwABBAkABAAaAQUAAwABBAkABQAWAR8AAwABBAkABgAaATUAAwABBAkACgBWAU8AAwABBAkACwAmAaUKQ3JlYXRlZCBieSBpY29uZm9udApybWVsLWljb25mb250UmVndWxhcnJtZWwtaWNvbmZvbnRybWVsLWljb25mb250VmVyc2lvbiAxLjBybWVsLWljb25mb250R2VuZXJhdGVkIGJ5IHN2ZzJ0dGYgZnJvbSBGb250ZWxsbyBwcm9qZWN0Lmh0dHA6Ly9mb250ZWxsby5jb20ACgBDAHIAZQBhAHQAZQBkACAAYgB5ACAAaQBjAG8AbgBmAG8AbgB0AAoAcgBtAGUAbAAtAGkAYwBvAG4AZgBvAG4AdABSAGUAZwB1AGwAYQByAHIAbQBlAGwALQBpAGMAbwBuAGYAbwBuAHQAcgBtAGUAbAAtAGkAYwBvAG4AZgBvAG4AdABWAGUAcgBzAGkAbwBuACAAMQAuADAAcgBtAGUAbAAtAGkAYwBvAG4AZgBvAG4AdABHAGUAbgBlAHIAYQB0AGUAZAAgAGIAeQAgAHMAdgBnADIAdAB0AGYAIABmAHIAbwBtACAARgBvAG4AdABlAGwAbABvACAAcAByAG8AagBlAGMAdAAuAGgAdAB0AHAAOgAvAC8AZgBvAG4AdABlAGwAbABvAC4AYwBvAG0AAAAAAgAAAAAAAAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaAQIBAwEEAQUBBgEHAQgBCQEKAQsBDAENAQ4BDwEQAREBEgETARQBFQEWARcBGAEZARoBGwADdGFiCGtleWJvYXJkBmRlbGV0ZQpjb2RlLWJsb2NrBGNvZGUKdmlzaWJpbGl0eQp2aWV3LXNwbGl0BGxpbmsEcmVkbwR1bmRvBGJvbGQGaXRhbGljDGxpc3Qtb3JkZXJlZA5saXN0LXVub3JkZXJlZAVxdW90ZQ1zdHJpa2V0aHJvdWdoCXVuZGVybGluZQR3cmFwCWZvbnQtc2l6ZQRncmlkBWltYWdlC2V4cGFuZC1sZXNzC2V4cGFuZC1tb3JlD2Z1bGxzY3JlZW4tZXhpdApmdWxsc2NyZWVuAAAAAAA=);
    src: url(data:font/ttf;base64,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) format("truetype")
  }

  .rmel-iconfont {
    font-family: rmel-iconfont !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale
  }

  .rmel-icon-tab:before {
    content: "\\e76d"
  }

  .rmel-icon-keyboard:before {
    content: "\\ed80"
  }

  .rmel-icon-delete:before {
    content: "\\ed3c"
  }

  .rmel-icon-code-block:before {
    content: "\\e941"
  }

  .rmel-icon-code:before {
    content: "\\ed3b"
  }

  .rmel-icon-visibility:before {
    content: "\\ed44"
  }

  .rmel-icon-view-split:before {
    content: "\\ed45"
  }

  .rmel-icon-link:before {
    content: "\\ed5f"
  }

  .rmel-icon-redo:before {
    content: "\\ed60"
  }

  .rmel-icon-undo:before {
    content: "\\ed61"
  }

  .rmel-icon-bold:before {
    content: "\\ed6f"
  }

  .rmel-icon-italic:before {
    content: "\\ed70"
  }

  .rmel-icon-list-ordered:before {
    content: "\\ed71"
  }

  .rmel-icon-list-unordered:before {
    content: "\\ed72"
  }

  .rmel-icon-quote:before {
    content: "\\ed73"
  }

  .rmel-icon-strikethrough:before {
    content: "\\ed74"
  }

  .rmel-icon-underline:before {
    content: "\\ed75"
  }

  .rmel-icon-wrap:before {
    content: "\\ed77"
  }

  .rmel-icon-font-size:before {
    content: "\\ed78"
  }

  .rmel-icon-grid:before {
    content: "\\ed8c"
  }

  .rmel-icon-image:before {
    content: "\\ed8d"
  }

  .rmel-icon-expand-less:before {
    content: "\\ed9f"
  }

  .rmel-icon-expand-more:before {
    content: "\\eda0"
  }

  .rmel-icon-fullscreen-exit:before {
    content: "\\eda1"
  }

  .rmel-icon-fullscreen:before {
    content: "\\eda2"
  }

  .rc-md-editor {
    padding-bottom: 1px;
    position: relative;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
            border-radius: 6px;
  }

  .rc-md-editor.full {
    width: 100%;
    height: 100% !important;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000
  }

  .rc-md-editor .editor-container {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    min-height: 0;
    position: relative;

  }

  .rc-md-editor .editor-container > .section {
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -webkit-flex-shrink: 1;
    -ms-flex-negative: 1;
    flex-shrink: 1;
    -webkit-flex-basis: 1px;
    -ms-flex-preferred-size: 1px;
    flex-basis: 1px;
    padding: 4px;

            border: none
  }

  .rc-md-editor .editor-container > .section.in-visible {
    display: none
  }

  .rc-md-editor .editor-container > .section > .section-container {
    padding: 8x 16px 16px
  }

  .rc-md-editor .editor-container > .section:last-child {
    border-radius: unset
  }

  .rc-md-editor .editor-container .sec-md {
    min-height: 0;
    min-width: 0
  }

  .rc-md-editor .editor-container .sec-md .input {
    background: transparent;
    font-size: 1rem;
    display: block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    border: none;
    resize: none;
    outline: none;
    min-height: 0;
    color: inherit;
    font-size: 14px;
    line-height: 1.7;

  }

  .rc-md-editor .editor-container .sec-html {
    min-height: 0;
    min-width: 0;

  }

  .rc-md-editor .editor-container .sec-html .html-wrap {
    height: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: auto
  }

  .custom-html-style {
    color: inherit
  }

  .custom-html-style h1 {
    font-size: 32px;
    padding: 0;
    border: none;
    font-weight: 700;
    margin: 32px 0;
    line-height: 1.2
  }

  .custom-html-style h2 {
    font-size: 24px;
    padding: 0;
    border: none;
    font-weight: 700;
    margin: 24px 0;
    line-height: 1.7
  }

  .custom-html-style h3 {
    font-size: 18px;
    margin: 18px 0;
    padding: 0;
    line-height: 1.7;
    border: none
  }

  .custom-html-style p {
    font-size: 14px;
    line-height: 1.7;
    margin: 8px 0
  }

  .custom-html-style a {
  }

  .custom-html-style a:hover {
    text-decoration: none
  }

  .custom-html-style strong {
    font-weight: 700
  }

  .custom-html-style ol, .custom-html-style ul {
    font-size: 14px;
    line-height: 28px;
    padding-left: 36px
  }

  .custom-html-style li {
    margin-bottom: 8px;
    line-height: 1.7
  }

  .custom-html-style hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
  }

  .custom-html-style pre {
    display: block;
    padding: 20px;
    line-height: 28px;
    word-break: break-word
  }

  .custom-html-style code, .custom-html-style pre {
    font-size: 14px;
    border-radius: 0;
    overflow-x: auto
  }

  .custom-html-style code {
    padding: 3px 0;
    margin: 0;
    word-break: normal
  }

  .custom-html-style code:after, .custom-html-style code:before {
    letter-spacing: 0
  }

  .custom-html-style blockquote {
    position: relative;
    margin: 16px 0;
    padding: 5px 8px 5px 30px;
    background: none repeat scroll 0 0 ${"rgb(39 39 41)"};
    color: inherit;
    border: none;
    border-left: 10px solid #d6dbdf
  }

  .custom-html-style img, .custom-html-style video {
    max-width: 100%
  }

  .custom-html-style table {
    font-size: 14px;
    line-height: 1.7;
    max-width: 100%;
    overflow: auto;

    border-collapse: collapse;
    border-spacing: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box
  }

  .custom-html-style table td, .custom-html-style table th {
    word-break: break-all;
    word-wrap: break-word;
    white-space: normal
  }

  .custom-html-style table tr {
  }

  .custom-html-style table tr:nth-of-type(2n) {
    background-color: transparent
  }

  .custom-html-style table th {
    text-align: center;
    font-weight: 700;

    padding: 10px 6px;
    background-color: #f5f7fa;
    word-break: break-word
  }

  .custom-html-style table td {

    text-align: left;
    padding: 10px 15px;
    word-break: break-word;
    min-width: 60px
  }

  .rc-md-editor .drop-wrap {
    display: block;
    position: absolute;
    left: 0;
    top: 28px;
    z-index: 2;
    min-width: 20px;
    padding: 10px 0;
    text-align: center;
    border-style: solid;
    border-width: 1px
  }

  .rc-md-editor .drop-wrap.hidden {
    display: none !important
  }

  .rc-md-editor .rc-md-navigation {
    min-height: 38px;
    padding: 0 8px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 16px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    -ms-flex-pack: justify;
    justify-content: space-between;
            color: "inherit",

  }

  .rc-md-editor .rc-md-navigation.in-visible {
    display: none
  }

  .rc-md-editor .rc-md-navigation .navigation-nav {
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    font-size: 14px;
  }

  .rc-md-editor .rc-md-navigation .button-wrap, .rc-md-editor .rc-md-navigation .navigation-nav {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row
  }

  .rc-md-editor .rc-md-navigation .button-wrap {
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap
  }

  .rc-md-editor .rc-md-navigation .button-wrap .button {
    position: relative;
    min-width: 22px;
    height: 28px;
    margin-left: 3px;
    margin-right: -2px;
    display: inline-block;
    cursor: pointer;
    line-height: 28px;
    text-align: center;
  }

  .rc-md-editor .rc-md-navigation .button-wrap .button:hover {
  }

  .rc-md-editor .rc-md-navigation .button-wrap .button.disabled {
    cursor: not-allowed
  }

  .rc-md-editor .rc-md-navigation .button-wrap .button:first-of-type {
    margin-left: 0
  }

  .rc-md-editor .rc-md-navigation .button-wrap .button:last-child {
    margin-right: 0
  }

  .rc-md-editor .rc-md-navigation .button-wrap .rmel-iconfont {
    font-size: 18px
  }

  .rc-md-editor .rc-md-navigation li, .rc-md-editor .rc-md-navigation ul {
    list-style: none;
    margin: 0;
    padding: 0
  }

  .rc-md-editor .rc-md-navigation .h1, .rc-md-editor .rc-md-navigation .h2, .rc-md-editor .rc-md-navigation .h3, .rc-md-editor .rc-md-navigation .h4, .rc-md-editor .rc-md-navigation .h5, .rc-md-editor .rc-md-navigation .h6, .rc-md-editor .rc-md-navigation h1, .rc-md-editor .rc-md-navigation h2, .rc-md-editor .rc-md-navigation h3, .rc-md-editor .rc-md-navigation h4, .rc-md-editor .rc-md-navigation h5, .rc-md-editor .rc-md-navigation h6 {
    font-family: inherit;
    font-weight: 500;
    color: inherit;
    padding: 0;
    margin: 0;
    line-height: 1.1
  }

  .rc-md-editor .rc-md-navigation h1 {
    font-size: 34px
  }

  .rc-md-editor .rc-md-navigation h2 {
    font-size: 30px
  }

  .rc-md-editor .rc-md-navigation h3 {
    font-size: 24px
  }

  .rc-md-editor .rc-md-navigation h4 {
    font-size: 18px
  }

  .rc-md-editor .rc-md-navigation h5 {
    font-size: 14px
  }

  .rc-md-editor .rc-md-navigation h6 {
    font-size: 12px
  }

  .rc-md-editor .tool-bar {
    position: absolute;
    z-index: 1;
    right: 8px;
    top: 8px
  }

  .rc-md-editor .tool-bar .button {
    min-width: 24px;
    height: 28px;
    margin-right: 5px;
    display: inline-block;
    cursor: pointer;
    font-size: 14px;
    line-height: 28px;
    text-align: center;
    color: #999
  }

  .rc-md-editor .tool-bar .button:hover {
    color: inherit
  }

  .rc-md-editor .rc-md-gray-100 {
    display: block;
    width: 1px;
  }

  .rc-md-editor .table-list.wrap {
    position: relative;
    margin: 0 10px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box
  }

  .rc-md-editor .table-list.wrap .list-item {
    position: absolute;
    top: 0;
    left: 0;
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px
  }

  .rc-md-editor .table-list.wrap .list-item.active {
  }

  .rc-md-editor .tab-map-list .list-item {
    width: 120px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box
  }

  .rc-md-editor .tab-map-list .list-item:hover {
  }

  .rc-md-editor .tab-map-list .list-item.active {
    font-weight: 700
  }

  .rc-md-editor .header-list .list-item {
    width: 100px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 8px 0
  }

  .rc-md-editor .header-list .list-item:hover {
  }

`
));
