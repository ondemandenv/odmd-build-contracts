import {ContractsBuild, SRC_Rev_REF} from "../../odmd-model/contracts-build";
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {Construct} from "constructs";
import {OndemandContracts} from "../../OndemandContracts";
import {ContractsCrossRefConsumer, ContractsCrossRefProducer} from "../../odmd-model/contracts-cross-refs";
import {ContractsEnverCtnImg} from "../../odmd-model/contracts-enver-ctn-img";

export class SampleSpringOpenApi3CdkEnver extends ContractsEnverCdk {
    constructor(owner: ContractsBuild<ContractsEnverCdk>, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.appImgRepoRef = new ContractsCrossRefConsumer(this, 'appImgRefProducer',
            OndemandContracts.inst.springOpen3Img.theOne.ctnImgRefProducer)

        this.appImgLatestRef = new ContractsCrossRefConsumer(this, 'appLatestRefProducer',
            OndemandContracts.inst.springOpen3Img.theOne.ctnImgRefProducer.latestSha)
        this.apiEndpoint = new ContractsCrossRefProducer<SampleSpringOpenApi3CdkEnver>(this, 'endpoint', {
            children: [
                {pathPart: 'api-doc'},
                {pathPart: 'swagger-ui'}
            ]
        })
    }

    readonly appImgRepoRef: ContractsCrossRefConsumer<SampleSpringOpenApi3CdkEnver, ContractsEnverCtnImg>
    readonly appImgLatestRef: ContractsCrossRefConsumer<SampleSpringOpenApi3CdkEnver, ContractsEnverCtnImg>
    readonly apiEndpoint: ContractsCrossRefProducer<SampleSpringOpenApi3CdkEnver>;

}

export class SampleSpringOpenApi3Cdk extends ContractsBuild<ContractsEnverCdk> {

    readonly envers: Array<SampleSpringOpenApi3CdkEnver>

    readonly theMaster: SampleSpringOpenApi3CdkEnver


    workDirs = ['cdk']

    gitHubRepo = OndemandContracts.inst.githubRepos.sample1
    ownerEmail?: string | undefined;

    constructor(scope: Construct) {
        super(scope, 'sampleSpringOpenAPI3cdk');
        this.theMaster = new SampleSpringOpenApi3CdkEnver(this,
            OndemandContracts.inst.accounts.workplace2, 'us-west-1',
            new SRC_Rev_REF('b', 'master')
        )

        this.envers = [this.theMaster]
    }

}