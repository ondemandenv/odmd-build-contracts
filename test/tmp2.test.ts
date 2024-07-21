import {OndemandContracts} from "../lib/OndemandContracts";
import {App} from "aws-cdk-lib";
import {ContractsBuild, SRC_Rev_REF} from "../lib/odmd-model/contracts-build";
import {OdmdBuildSampleSpringCdk} from "../lib/repos/sample/cdk/odmd-build-sample-spring-cdk";
import {ContractsCrossRefConsumer} from "../lib/odmd-model/contracts-cross-refs";
import {ContractsEnverCtnImg} from "../lib/odmd-model/contracts-enver-ctn-img";


function extracted(ss: ContractsBuild<any>) {
    const srcRevREF = new SRC_Rev_REF("b", 'newDy', ss.envers[0].targetRevision);
    ss.refreshDynamicEnvers([
        srcRevREF
    ])

    const de = ss.dynamicEnvers.find(de => de.targetRevision.toPathPartStr().startsWith(ss.envers[0].targetRevision.toPathPartStr()))

    if (!de) {
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

    if (OndemandContracts.inst.springRdsCdk.deployToSelfDefinedEcs.appImgName != ContractsCrossRefConsumer.fromOdmdRef(tmp)) {
        throw new Error("!")
    }

    OndemandContracts.inst.odmdBuilds.forEach(b => {
        b.envers
            .filter(e => e instanceof ContractsEnverCtnImg)
            .map(e => e as ContractsEnverCtnImg)
            .forEach(e => {
                Object.entries(e.builtImgNameToRepo).forEach(([k, v]) => {
                    const kn = k.split(':')[0]
                    if (kn != kn.toLowerCase()) {
                        //2024-06-30T02:52:01.5533755Z Error parsing reference: "cdkSpringRds-app:0.0.1-SNAPSHOT" is not a valid repository/tag: invalid reference format: repository name (library/cdkSpringRds-app) must be lowercase
                        throw new Error(`builtImg Key repo name:${k} >> in enver: ${e.toString()}, is not lower cased`)
                    }
                    if (!e.builtImgNameToRepoProducer.hasOwnProperty(k)) {
                        throw new Error(`builtImgNameToRepo Key:${k} >> not found in builtImgNameToRepoProducer, in enver: ${e.toString()} is not lower cased`)
                    }

                    if (!v.repositoryName || !v.repositoryName.startsWith(b.buildId.toLowerCase() + '/')) {
                        throw new Error(`repo name have to start with buildId and slash, got: ${v.repositoryName}`)
                    }

                })
            })

        b.node.findAll().forEach(c => {
            OndemandContracts.inst.allAccounts.forEach(a => {
                if (c.node.id.includes(a)) {
                    throw new Error(c.node.path + ' using account inside id? change to use account name' + c.constructor)
                }
            })
        })
    })

});
