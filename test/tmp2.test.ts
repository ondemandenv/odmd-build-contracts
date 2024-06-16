import {OndemandContracts} from "../lib/OndemandContracts";
import {App} from "aws-cdk-lib";
import {ContractsBuild, SRC_Rev_REF} from "../lib/odmd-model/contracts-build";
import {OdmdBuildSampleSpringCdk} from "../lib/repos/sample/cdk/odmd-build-sample-spring-cdk";
import {ContractsCrossRefConsumer} from "../lib/odmd-model/contracts-cross-refs";


function extracted(ss: ContractsBuild<any>) {
    const srcRevREF = new SRC_Rev_REF("b", 'newDy', ss.envers[0].targetRevision.toString());
    ss.refreshDynamicEnvers([
        srcRevREF
    ])

    const de = ss.dynamicEnvers.find(de => de.targetRevision.toString().startsWith('b:newDy@'))!

    if (de.targetRevision.toString() != srcRevREF.toString()) {
        throw new Error(' ... ')
    }
}

test('make_sense2', () => {

    process.env.CDK_DEFAULT_ACCOUNT = 'aaaaaa'
    process.env.CDK_DEFAULT_REGION = 'us-west-1'
    const app = new App()
    new OndemandContracts(app)


    extracted(OndemandContracts.inst.springRdsCdk);
    extracted(OndemandContracts.inst.eksCluster);
    extracted(OndemandContracts.inst.defaultEcrEks);
    extracted(OndemandContracts.inst.defaultVpcRds);
    extracted(OndemandContracts.inst.networking);

    const tmp = OndemandContracts.inst.springRdsCdk.deployToSelfDefinedEcs.appImgName.toOdmdRef();

    if( OndemandContracts.inst.springRdsCdk.deployToSelfDefinedEcs.appImgName != ContractsCrossRefConsumer.fromOdmdRef( tmp ) ){
        throw new Error( "!")
    }

});
