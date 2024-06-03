import {ContractsEnver} from "./contracts-enver";
import {ContractsBuild} from "./contracts-build";
import {RepositoryProps} from "aws-cdk-lib/aws-ecr";
import {ContractsCrossRefProducer} from "./contracts-cross-refs";


export abstract class ContractsEnverContainerimg extends ContractsEnver<ContractsBuild<ContractsEnverContainerimg>> {

    /**
     * commands to run to build images
     */
    abstract readonly buildCmds: string[];
    /**
     * images build by buildCmds
     */
    abstract readonly builtImgNameToTags: Map<string, string[]>;
    abstract readonly builtImgNameToRepo: {
        [imgName: string]: RepositoryProps//props can be just empty
    }

    abstract readonly builtImgNameToRepoProducer: {
        [imgName: string]: ContractsCrossRefProducer<ContractsEnverContainerimg>
    }


}