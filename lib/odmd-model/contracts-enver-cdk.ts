import {ContractsBuild, SRC_Rev_REF} from "./contracts-build";
import {ContractsEnver, IContractsEnver} from "./contracts-enver";

export class ContractsEnverCdk extends ContractsEnver<ContractsBuild<ContractsEnverCdk>> {

    /**
     * initial deployment will disable rollback withno changeset or approval automatically
     * this is only for deploying updates
     */
    readonly noRollback?: boolean
    readonly changeSetNoDeploy?: boolean

    //todo
    readonly approvalRole?: string//will be used when len > 3

    readonly preCdkCmds: Array<string> = [
        //todo: get the org dynamically
        'echo "@ondemandenv:registry=https://npm.pkg.github.com/" >> .npmrc',
        'echo "//npm.pkg.github.com/:_authToken=$github_token" >> .npmrc'
    ]

    readonly contextStrs?: Array<string>


    /*todo
                    const subnetToEnv = acr.reduce((map, e) => {
                        let cs = e.rdsConfig!.subnets;
                        if (!map.has(cs)) {
                            map.set(cs, [])
                        }
                        map.get(cs)!.push(e)
                        return map;
                    }, new Map<SubnetSelection, OdmdEnVerConfig[]>())

                    if( subnetToEnv.size > 1 ){
                        throw new Error( "RDS subnets are not referencing ")
                    }
    */

    /**
     * what stacks the enver will generate?
     * different stacknames for different branches, avoid conflicts when all deployed into one region/account
     * especially when dynamic env by branching/tagging
     * stackname has to start with buildId name!!!
     * we need to know stack names to monitor, so no wildcard supported until we run cdk ls
     * Make sure it's consistent
     */
    getRevStackNames(): Array<string> {
        const revStr = this.targetRevision.type == 'b' ? this.targetRevision.value : this.targetRevision.toString();
        const rt = [`${this.owner.buildId}--${revStr}`];
        return rt.map(n => ContractsEnverCdk.SANITIZE_STACK_NAME(n))
    }

    generateDynamicEnver(rev: SRC_Rev_REF, newInst: IContractsEnver | undefined = undefined): IContractsEnver {
        if (!newInst) {
            newInst = new ContractsEnverCdk(this.owner, this.targetAWSAccountID, this.targetAWSRegion, rev) as IContractsEnver
        }
        return newInst
    }

    public static SANITIZE_STACK_NAME(n: string) {
        let sanitized = n.replace(/[^a-zA-Z0-9]/g, '-');
        if (sanitized.startsWith('-')) {
            sanitized = 'A' + sanitized.slice(1);
        }
        if (sanitized.endsWith('-')) {
            sanitized = sanitized.slice(0, -1) + 'Z';
        }
        if (n != sanitized) {
            console.log(`${n} sanitized to ${sanitized}`)
        }
        return sanitized
    }
}
