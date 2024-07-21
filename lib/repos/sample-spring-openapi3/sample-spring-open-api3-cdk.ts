import {ContractsBuild, SRC_Rev_REF} from "../../odmd-model/contracts-build";
import {ContractsEnverCdk} from "../../odmd-model/contracts-enver-cdk";
import {Construct} from "constructs";
import {OndemandContracts} from "../../OndemandContracts";
import {ContractsCrossRefConsumer, ContractsCrossRefProducer} from "../../odmd-model/contracts-cross-refs";
import {ContractsEnverCtnImg} from "../../odmd-model/contracts-enver-ctn-img";

export class SampleSpringOpenApi3Cdk extends ContractsBuild<ContractsEnverCdk> {

    readonly envers: Array<ContractsEnverCdk>

    readonly theOne: ContractsEnverCdk

    readonly appImgRepoRef: ContractsCrossRefConsumer<ContractsEnverCdk, ContractsEnverCtnImg>
    readonly appImgLatestRef: ContractsCrossRefConsumer<ContractsEnverCdk, ContractsEnverCtnImg>

    readonly apiEndpoint: ContractsCrossRefProducer<ContractsEnverCdk>;

    workDirs = ['cdk']

    gitHubRepo = OndemandContracts.inst.githubRepos.sample1
    ownerEmail?: string | undefined;


    constructor(scope: Construct) {
        super(scope, 'sampleSpringOpenAPI3cdk');
        this.theOne = new class extends ContractsEnverCdk {
        }(this, OndemandContracts.inst.accounts.workplace2, 'us-west-1',
            new SRC_Rev_REF('b', 'master')
        )

        this.apiEndpoint = new ContractsCrossRefProducer<ContractsEnverCdk>(this.theOne, 'endpoint', {
            children: [
                {pathPart: 'api-doc'},
                {pathPart: 'swagger-ui'}
            ]
        })

        this.appImgRepoRef = new ContractsCrossRefConsumer(this.theOne, 'appImgRefProducer',
            OndemandContracts.inst.springOpen3Img.theOne.ctnImgRefProducer)

        this.appImgLatestRef = new ContractsCrossRefConsumer(this.theOne, 'appLatestRefProducer',
            OndemandContracts.inst.springOpen3Img.theOne.ctnImgRefProducer.latestSha)

        this.envers = [this.theOne]

    }

}