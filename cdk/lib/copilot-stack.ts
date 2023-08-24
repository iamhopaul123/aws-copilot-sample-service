import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from "aws-cdk-lib/aws-iam"
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class AppStack extends cdk.Stack {
  public readonly AdministrationRole: iam.Role;
  public readonly ExecutionRole: iam.Role;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Parameters
    new cdk.CfnParameter(this, 'AppName', {
      type: 'String',
    })

    // Conditions

    // Resources
    this.AdministrationRole = new iam.Role(this, 'AdministrationRole', {
      roleName: cdk.Fn.sub('${AppName}-adminrole'),
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
      path: '/',
      inlinePolicies: {
        'AssumeRole-AWSCloudFormationStackSetExecutionRole': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['sts:AssumeRole'],
              resources: [cdk.Fn.sub('arn:aws:iam::${AWS::AccountId}:role/${ExecutionRoleName}')],
            })
          ]
        })
      }
    })
    this.ExecutionRole = new iam.Role(this, 'ExecutionRole', {
      roleName: cdk.Fn.sub('${AppName}-executionrole'),
      assumedBy: new iam.ArnPrincipal(this.AdministrationRole.roleArn),
      path: '/',
      inlinePolicies: {
        'ExecutionRolePolicy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: 'MockPolicy',
              actions: ['*'],
              resources: ['*'],
            })
          ]
        })
      }
    })
    // Outputs
  }
}

export class EnvStack extends cdk.Stack {
  public readonly CloudformationExecutionRole: iam.Role;
  public readonly EnvironmentManagerRole: iam.Role;
  public readonly VPC: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Parameters
    new cdk.CfnParameter(this, 'AppName', {
      type: 'String',
    })
    new cdk.CfnParameter(this, 'EnvironmentName', {
      type: 'String',
    })
    new cdk.CfnParameter(this, 'ALBWorkloads', {
      type: 'String',
    })

    // Conditions
    const CreateALB = new cdk.CfnCondition(this, 'CreateALB', {
      expression: cdk.Fn.conditionNot(cdk.Fn.conditionEquals(cdk.Fn.ref('ALBWorkloads'), '')),
    })

    // Resources
    this.CloudformationExecutionRole = new iam.Role(this, 'CloudformationExecutionRole', {
      roleName: cdk.Fn.sub('${AWS::StackName}-CFNExecutionRole'),
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
      path: '/',
      inlinePolicies: {
        'executeCfn': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: 'MockPolicy',
              actions: ['*'],
              resources: ['*'],
            })
          ]
        })
      }
    })
    this.EnvironmentManagerRole = new iam.Role(this, 'EnvironmentManagerRole', {
      roleName: cdk.Fn.sub('${AWS::StackName}-EnvManagerRole'),
      assumedBy: new iam.ArnPrincipal(cdk.Fn.sub('arn:aws:iam::${AWS::AccountId}:root')),
      path: '/',
      inlinePolicies: {
        'root': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: 'MockPolicy',
              actions: ['*'],
              resources: ['*'],
            })
          ]
        })
      }
    })
    this.VPC = new ec2.Vpc(this, 'VPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 2
    })
    // new ec2.CfnInternetGateway()
    // new ec2.CfnRouteTable(this, 'PublicRouteTable', {
    //   vpcId: this.VPC.vpcId,
    // })
    // new ec2.CfnRoute(this, 'DefaultPublicRoute', {

    // })
  }
}

