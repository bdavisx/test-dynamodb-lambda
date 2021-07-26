import { STS } from '@aws-sdk/client-sts';
import { AssumeRoleParams } from '@aws-sdk/credential-provider-ini';
import { Credentials } from '@aws-sdk/types';

export const roleAssumer = async (sourceCreds: Credentials, assumeRoleParams: AssumeRoleParams) => {
  const sts = new STS({ region: 'us-east-1', credentials: sourceCreds });
  const { Credentials } = await sts.assumeRole({ ...assumeRoleParams });
  if (!Credentials)
    throw Error('Could not assume role');
  return {
    accessKeyId: Credentials.AccessKeyId!,
    secretAccessKey: Credentials.SecretAccessKey!,
    sessionToken: Credentials.SessionToken!,
    expiration: Credentials.Expiration!,
  };
};
