import {ContractsBuild, SRC_Rev_REF} from "./contracts-build";
import {ContractsEnver} from "./contracts-enver";

export class ContractsEnverNpm extends ContractsEnver<ContractsBuild<ContractsEnverNpm>> {


    constructor(owner: ContractsBuild<ContractsEnverNpm>, targetAWSAccountID: string, targetAWSRegion: string, targetRevision: SRC_Rev_REF, buildCmds: string[] | undefined = undefined) {
        super(owner, targetAWSAccountID, targetAWSRegion, targetRevision);
        this.buildCmds = buildCmds;
    }

//Make sure WF has enough permission:  https://github.com/orgs/${organization}/packages/npm/${repo}/settings
    readonly buildCmds: string[] | undefined = undefined;

    /**
     * `$(jq -r '.version' package.json | cut -d'-' -f1)-${branch}$(date +'%Y%m%d_%H%M%S')`
     * @param branch
     * @param env
     */
    // abstract getNpmVersionArg(branch: string, env?: OdmdEnVerNpmConfig): string

    /*
    readonly publish: {
        authToken: { githubToken: { npmrcOverwrite: boolean } }
            | { secretName: string, npmrcOverwrite: boolean },
        scope: string,
        registry: string
    } = {
        scope: '@ondemandenv',
        registry: 'npm.pkg.github.com',
        authToken: {
            githubToken: {npmrcOverwrite: true}
        }
    }

    'echo "@ondemandenv:registry=https://npm.pkg.github.com/" >> .npmrc',
    'echo "//npm.pkg.github.com/:_authToken=${{secrets.GITHUB_TOKEN}}" >> .npmrc',
    */


}