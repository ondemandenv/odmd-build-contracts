import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {OdmdBuildOdmdContracts} from "./odmd-build-odmd-contracts";
import {Construct} from "constructs";
import {OndemandContracts} from "../../OndemandContracts";
import {SRC_Rev_REF} from "../../odmd-model/contracts-build";

export class OdmdConfigOdmdContractsCdk extends OdmdBuildOdmdContracts<ContractsEnverCdk> {

    readonly envers: Array<ContractsEnverCdk> = [
        new ContractsEnverCdk(
            this, OndemandContracts.inst.accounts.workplace1,
            "us-west-1",
            new SRC_Rev_REF("b", "odmdSbxUsw1")
        )
    ]

    constructor(scope: Construct) {
        super(scope, 'odmd-contracts-cdk');
    }

}
