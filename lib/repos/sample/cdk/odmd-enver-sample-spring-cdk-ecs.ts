import {PgSchemaUsersProps, PgUsr} from "../../../odmd-model/contracts-pg-schema-usrs";
import {OndemandContracts} from "../../../OndemandContracts";
import {ContractsVpc} from "../../../odmd-model/contracts-vpc";
import {ContractsRdsCluster, WithRds} from "../../../odmd-model/contracts-rds-cluster";
import {OdmdBuildSampleSpringCdk} from "./odmd-build-sample-spring-cdk";
import {ContractsEnverCdk} from "../../../odmd-model/contracts-enver-cdk";
import {BorrowVpcRds} from "../../_default-vpc-rds/odmd-build-default-vpc-rds";
import {ContractsEnverCdkDefaultVpc} from "../../_default-vpc-rds/odmd-enver-default-vpc-rds";
import {SRC_Rev_REF} from "../../../odmd-model/contracts-build";
import {ContractsCrossRefConsumer} from "../../../odmd-model/contracts-cross-refs";
import {AnyContractsEnVer} from "../../../odmd-model/contracts-enver";


export class OdmdEnverSampleSpringCdkEcs extends ContractsEnverCdk implements BorrowVpcRds, WithRds {


    readonly vpcRdsProvidingEnver: ContractsEnverCdkDefaultVpc;

    readonly vpcConfig: ContractsVpc
    readonly rdsConfig: ContractsRdsCluster

    public readonly pgSchemaUsersProps: PgSchemaUsersProps
    public readonly readOnlyPub: PgUsr


    readonly imgSrcEnver

    readonly rdsPort: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly rdsHost: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly rdsSocketAddress: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly rdsUsrReadOnly: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>

    readonly migImgName: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>
    readonly appImgName: ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, AnyContractsEnVer>

    constructor(owner: OdmdBuildSampleSpringCdk) {
        super(owner, OndemandContracts.inst.accounts.workplace2, "us-west-1", new SRC_Rev_REF("b", "odmdSbxUsw1"));


        this.readOnlyPub = {
            roleType: 'readonly',
            userName: 'cdkecs_readonly1'
        };

        this.vpcRdsProvidingEnver = OndemandContracts.inst.defaultVpcRds.getOrCreateOne(this, {
            ipamEnver: OndemandContracts.inst.networking.ipam_west1_le,
            vpcName: 'springcdkecs'
        })

        this.vpcConfig = this.vpcRdsProvidingEnver.vpcConfig
        this.rdsConfig = this.vpcRdsProvidingEnver.getOrCreateRdsCluster('sample')


        this.pgSchemaUsersProps = new PgSchemaUsersProps(this, 'cdkecs', [this.readOnlyPub]);
        this.vpcRdsProvidingEnver.addSchemaUsers(this.rdsConfig, this.pgSchemaUsersProps)

        this.rdsPort = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsPort', this.rdsConfig.clusterPort)
        this.rdsHost = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsHost', this.rdsConfig.clusterHostname)
        this.rdsSocketAddress = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsSocketAddress', this.rdsConfig.clusterSocketAddress)
        this.rdsUsrReadOnly = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'rdsUsrReadOnly', this.rdsConfig.usernameToSecretId.get(this.readOnlyPub.userName)!)

        this.preCdkCmds.push('npm run build')
        this.imgSrcEnver = OndemandContracts.inst.springRdsImg.enverImg;

        this.migImgName = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'migImgName', this.imgSrcEnver.migImgRefProducer)
        this.appImgName = new ContractsCrossRefConsumer<OdmdEnverSampleSpringCdkEcs, any>(this, 'appImgName', this.imgSrcEnver.appImgRefProducer)

        const imgToRepoProducers = this.imgSrcEnver.builtImgNameToRepoProducer;

        for (const imgName in imgToRepoProducers) {
            new ContractsCrossRefConsumer(this, imgName, imgToRepoProducers[imgName])
        }
    }

}
