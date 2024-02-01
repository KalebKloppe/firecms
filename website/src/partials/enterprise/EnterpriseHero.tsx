import React from "react";
import { CTAOutlinedButtonWhiteMixin } from "../styles";
import { Hero } from "../general/Hero";

export function EnterpriseHero() {

    return <Hero
        color={"primary"}
        title={
            <>
                <span className="block lg:inline">Your admin panel</span>
            </>}
        subtitle={
            <>
                <p>We know what it takes to build a successful product and we are here to help you.</p>
            </>}
    />;
}
