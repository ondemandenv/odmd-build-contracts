import {OdmdBuildSampleSpringCdk} from "./odmd-build-sample-spring-cdk";
import {OndemandContracts} from "../../../OndemandContracts";
import {ContractsRdsCluster, WithRds} from "../../../odmd-model/contracts-rds-cluster";
import {ContractsVpc} from "../../../odmd-model/contracts-vpc";
import {ContractsEnverCdk} from "../../../odmd-model/contracts-enver-cdk";
import {SRC_Rev_REF} from "../../../odmd-model/contracts-build";
import {ContractsCrossRefConsumer} from "../../../odmd-model/contracts-cross-refs";
import {ContractsEnverContainerimg} from "../../../odmd-model/contracts-enver-containerImg";

/**
 * so that the cdk code to use EksManifest which takes KubeCtlThruVpc as param
 */
export class OdmdEnverSampleSpringCdkKubeEks extends ContractsEnverCdk implements WithRds {


    vpcConfig: ContractsVpc
    rdsConfig: ContractsRdsCluster

    readonly appImg: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkKubeEks, ContractsEnverContainerimg>
    readonly migrateImg: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkKubeEks, ContractsEnverContainerimg>

    constructor(param: OdmdBuildSampleSpringCdk) {
        super(param, OndemandContracts.inst.accounts.workplace1, "us-west-1", new SRC_Rev_REF("b", "p0dmdSbxUsw1"))

        const vpcRds = OndemandContracts.inst.defaultVpcRds.getOrCreateOne(this, {
            ipamEnver: OndemandContracts.inst.networking.ipam_west1_le,
            vpcName: 'springcdkecs'
        })
        this.vpcConfig = vpcRds.vpcConfig
        this.rdsConfig = vpcRds.getOrCreateRdsCluster('sample')

        this.migrateImg = new ContractsCrossRefConsumer(this, 'migImage', OndemandContracts.inst.springRdsImg.enverImg.migImgRefProducer);
        this.appImg = new ContractsCrossRefConsumer(this, 'appContainer', OndemandContracts.inst.springRdsImg.enverImg.appImgRefProducer);

    }

}
