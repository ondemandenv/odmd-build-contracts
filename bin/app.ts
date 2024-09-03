#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {OndemandContracts} from "../lib/OndemandContracts";
import {Stack} from "aws-cdk-lib";


const app = new cdk.App({autoSynth: false});

async function main() {

    const buildRegion = process.env.CDK_DEFAULT_REGION;
    const buildAccount = process.env.CDK_DEFAULT_ACCOUNT;
    if (!buildRegion || !buildAccount) {
        throw new Error("buildRegion>" + buildRegion + "; buildAccount>" + buildAccount)
    }

    new OndemandContracts(app)
    new Stack(app, 'dummy')
    const csa = app.synth();
    // await tmpTst(app, csa)


    // const targetEnver = OndemandContracts.inst.getTargetEnver() as ContractsEnverCdk


}


console.log("main begin.")
main().catch(e => {
    console.error(e)
    throw e
}).finally(() => {
    console.log("main end.")
})