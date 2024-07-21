import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {OdmdBuildOdmdContracts} from "./odmd-build-odmd-contracts";
import {Construct} from "constructs";
import {OndemandContracts} from "../../OndemandContracts";
import {SRC_Rev_REF} from "../../odmd-model/contracts-build";
import {ContractsCrossRefConsumer} from "../../odmd-model/contracts-cross-refs";
import {ContractsEnverCtnImg} from "../../odmd-model/contracts-enver-ctn-img";
import {IPAM_AB} from "../__networking/odmd-config-networking";

export class OdmdConfigOdmdContractsCdk extends OdmdBuildOdmdContracts<ContractsEnverCdk> {


    readonly envers: Array<ContractsEnverCdk>

    readonly theOne: ContractsEnverCdk

    readonly appImgRef: ContractsCrossRefConsumer<ContractsEnverCdk, ContractsEnverCtnImg>
    readonly migImgRef: ContractsCrossRefConsumer<ContractsEnverCdk, ContractsEnverCtnImg>
    readonly tgwRef: ContractsCrossRefConsumer<ContractsEnverCdk, IPAM_AB>

    constructor(scope: Construct) {
        super(scope, 'odmd-contracts-cdk');
        this.theOne = new class extends ContractsEnverCdk {
            getRevStackNames(): Array<string> {
                return super.getRevStackNames();
            }
        }(
            this, OndemandContracts.inst.accounts.workplace1,
            "us-west-1",
            new SRC_Rev_REF("b", "odmdSbxUsw1")
        )
        this.envers = [this.theOne]


        this.appImgRef = new ContractsCrossRefConsumer(this.theOne, 'appImgRefProducer', OndemandContracts.inst.springRdsImg.enverImg.appImgRefProducer)
        this.migImgRef = new ContractsCrossRefConsumer(this.theOne, 'migImgRefProducer', OndemandContracts.inst.springRdsImg.enverImg.migImgRefProducer)
        this.tgwRef = new ContractsCrossRefConsumer(this.theOne, 'tgwRef', OndemandContracts.inst.networking.ipam_west1_le.transitGatewayShareName)

    }

}
