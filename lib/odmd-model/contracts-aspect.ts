import {CfnParameter, IAspect, Stack} from "aws-cdk-lib";
import {IConstruct} from "constructs";
import {OndemandContracts} from "../OndemandContracts";

export class ContractsAspect implements IAspect {
    visit(node: IConstruct): void {
        if (node instanceof Stack) {
            const s = node as Stack

            new CfnParameter(s, OndemandContracts.STACK_PARAM_BUILD_SRC_REPO, {
                type: 'String',
                default: '',
                description: 'available when deployed by odmd pipeline'
            })

            new CfnParameter(s, OndemandContracts.STACK_PARAM_ODMD_DEP_REV, {
                type: 'String',
                default: '',
                description: 'available when deployed by odmd pipeline'
            })

            new CfnParameter(s, OndemandContracts.STACK_PARAM_ODMD_BUILD, {
                type: 'String',
                default: '',
                description: 'available when deployed by odmd pipeline'
            })

            new CfnParameter(s, OndemandContracts.STACK_PARAM_BUILD_SRC_REV, {
                type: 'String',
                default: '',
                description: 'available when deployed by odmd pipeline'
            })

            new CfnParameter(s, OndemandContracts.STACK_PARAM_BUILD_SRC_REF, {
                type: 'String',
                default: '',
                description: 'available when deployed by odmd pipeline'
            })

        }
    }
}