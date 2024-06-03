import {OdmdBuildSampleSpringCdk} from "./odmd-build-sample-spring-cdk";
import {OndemandContracts} from "../../../OndemandContracts";
import {ContractsRdsCluster, WithRds} from "../../../odmd-model/contracts-rds-cluster";
import {ContractsVpc} from "../../../odmd-model/contracts-vpc";
import {ContractsEnverCdk} from "../../../odmd-model/contracts-enver-cdk";
import {PgSchemaUsersProps, PgUsr} from "../../../odmd-model/contracts-pg-schema-usrs";
import {SRC_Rev_REF} from "../../../odmd-model/contracts-build";
import {ContractsCrossRefConsumer} from "../../../odmd-model/contracts-cross-refs";

/**
 * so that the cdk code to use EksManifest which takes KubeCtlThruVpc as param
 */
export class OdmdEnverSampleSpringCdkKubeEks extends ContractsEnverCdk implements WithRds {


    vpcConfig: ContractsVpc
    rdsConfig: ContractsRdsCluster

    public readonly pgSchemaUsersProps: PgSchemaUsersProps

    constructor(param: OdmdBuildSampleSpringCdk) {
        super(param, OndemandContracts.inst.accounts.workplace1, "us-west-1", new SRC_Rev_REF("b", "p0dmdSbxUsw1"))

        const readOnlyPub = {
            roleType: 'readonly',
            userName: 'cdkeks_readonly1'
        } as PgUsr

        const vpcRds = OndemandContracts.inst.defaultVpcRds.getOrCreateOne(this, {
            ipamEnver: OndemandContracts.inst.networking.ipam_west1_le,
            vpcName: 'springcdkecs'
        })
        this.vpcConfig = vpcRds.vpcConfig
        this.rdsConfig = vpcRds.getOrCreateRdsCluster('sample')

        this.pgSchemaUsersProps = new PgSchemaUsersProps(this, 'cdkeks', [readOnlyPub]);

        vpcRds.addSchemaUsers(this.rdsConfig, this.pgSchemaUsersProps)

        const migImgRefConsumer = new ContractsCrossRefConsumer(this, 'migContainer',
            OndemandContracts.inst.springRdsImg.enverImg.appImgRefProducer
        );
        const appImgRefConsumer = new ContractsCrossRefConsumer(this, 'appContainer',
            OndemandContracts.inst.springRdsImg.enverImg.migImgRefProducer
        );

        const tt = OndemandContracts.inst.defaultEcrEks.getOrCreateOne(this, {
            targetEksCluster: OndemandContracts.inst.eksCluster.argoClusterEnver,
            targetNamespace: this.owner.buildId + '/' + this.targetRevision.toString(),
            migration: {containers: [{image: migImgRefConsumer.toOdmdRef()}]},
            deployment: {containers: [{image: appImgRefConsumer.toOdmdRef()}]},
        })
    }

}
