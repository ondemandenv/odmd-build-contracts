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
     * images build by buildCmds all ready has src commit and latest as tags, so extra tags can be empty
     */
    abstract readonly imageNameToExtraTags: Map<string, string[]>;

    //leave RepositoryProps empty is fine
    abstract readonly builtImgNameToRepo: {
        [imgName: string]: RepositoryProps//props can be just empty
    }

    //so that the repo can be referenced
    abstract readonly builtImgNameToRepoProducer: {
        [imgName: string]: ContractsCrossRefProducer<ContractsEnverContainerimg>
    }


}