import {ContractsBuild, SRC_Rev_REF} from "../../../odmd-model/contracts-build";
import {ContractsEnverContainerimg} from "../../../odmd-model/contracts-enver-containerImg";
import {RepositoryProps} from "aws-cdk-lib/aws-ecr";
import {OndemandContracts} from "../../../OndemandContracts";
import {ContractsVpc} from "../../../odmd-model/contracts-vpc";
import {ContractsCrossRefConsumer, ContractsCrossRefProducer} from "../../../odmd-model/contracts-cross-refs";

export class OdmdEnverSampleSpringImg extends ContractsEnverContainerimg {

    readonly builtImgNameToTags: Map<string, string[]>;
    readonly builtImgNameToRepo: {
        [imgName: string]: RepositoryProps//props can be just empty
    }
    readonly builtImgNameToRepoProducer: {
        [imgName: string]: ContractsCrossRefProducer<ContractsEnverContainerimg>
    }

    readonly appName = `payments-app`
    readonly appImgName = `${this.appName}:0.0.1-SNAPSHOT`

    readonly migName = `payments-db-migration`
    readonly migImgName = `${this.migName}:0.0.1-SNAPSHOT`
    readonly appImgRefProducer: ContractsCrossRefProducer<ContractsEnverContainerimg>;
    readonly migImgRefProducer: ContractsCrossRefProducer<ContractsEnverContainerimg>;


    buildCmds: string[] = ['chmod +x gradlew && ./gradlew clean build bootBuildImage -x generateGitProperties -x test --info --stacktrace'];


    readonly vpcConfig: ContractsVpc;


    constructor(owner: ContractsBuild<ContractsEnverContainerimg>) {
        super(owner, OndemandContracts.inst.accounts.workplace1, "us-west-1", new SRC_Rev_REF("b", "odmdSbxUsw1"));
        this.builtImgNameToTags = new Map<string, string[]>([
            [this.appImgName, ['latest']],
            [this.migImgName, ['latest']],
        ]);

        const appRepoName = this.appName + this.targetRevision;
        const migRepoName = this.migImgName + this.targetRevision;
        this.builtImgNameToRepo = {
            [this.appImgName]: {repositoryName: appRepoName.toLowerCase().replace(/[^a-z0-9-_/]/g, '')},
            [this.migImgName]: {repositoryName: migRepoName.toLowerCase().replace(/[^a-z0-9-_/]/g, '')}
        }

        this.appImgRefProducer = new ContractsCrossRefProducer<ContractsEnverContainerimg>(this, 'payments-app-ref-producer', 'payments-app');
        this.migImgRefProducer = new ContractsCrossRefProducer<ContractsEnverContainerimg>(this, 'payments-db-migration-producer', 'payments-db-migration');
        this.builtImgNameToRepoProducer = {
            [this.appImgName]: this.appImgRefProducer,
            [this.migImgName]: this.migImgRefProducer,
        };

        const vpcRds = OndemandContracts.inst.defaultVpcRds.getOrCreateOne(this, {
            ipamEnver: OndemandContracts.inst.networking.ipam_west1_le,
            vpcName: 'springcdkecs'
        })

        this.vpcConfig = vpcRds.vpcConfig

        const migImgRefConsumer = new ContractsCrossRefConsumer(this, 'migContainer', this.migImgRefProducer);
        const appImgRefConsumer = new ContractsCrossRefConsumer(this, 'appContainer', this.appImgRefProducer);

        const tt = OndemandContracts.inst.defaultEcrEks.getOrCreateOne(this, {
            targetEksCluster: OndemandContracts.inst.eksCluster.argoClusterEnver,
            targetNamespace: this.owner.buildId + '/' + this.targetRevision.toString(),
            migration: {containers: [{image: migImgRefConsumer.toOdmdRef()}]},
            deployment: {containers: [{image: appImgRefConsumer.toOdmdRef()}]},
        })

    }

}