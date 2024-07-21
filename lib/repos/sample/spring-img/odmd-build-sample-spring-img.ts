import {ContractsBuild} from "../../../odmd-model/contracts-build";
import {ContractsEnverCtnImg} from "../../../odmd-model/contracts-enver-ctn-img";
import {Construct} from "constructs";
import {OdmdEnverSampleSpringImg} from "./odmd-enver-sample-spring-img";
import {OndemandContracts} from "../../../OndemandContracts";

export class OdmdBuildSampleSpringImg extends ContractsBuild<ContractsEnverCtnImg> {

    gitHubRepo =  OndemandContracts.inst.githubRepos.sample

    ownerEmail?: string | undefined;

    readonly envers: Array<ContractsEnverCtnImg>

    readonly enverImg: OdmdEnverSampleSpringImg

    constructor(scope: Construct) {
        super(scope, 'spring-rds-img');
        this.enverImg = new OdmdEnverSampleSpringImg(this)
        this.envers = [
            this.enverImg
        ]
    }
}
