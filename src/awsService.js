import AWS from 'aws-sdk';

// Function to get EC2 instance with specified region and credentials
const getEc2Instance = (region, accessKeyId, secretAccessKey) => {
  AWS.config.update({
    region,
    accessKeyId,
    secretAccessKey,
  });
  return new AWS.EC2({ region });
};

export const listInstances = async (region, accessKeyId, secretAccessKey) => {
  const ec2 = getEc2Instance(region, accessKeyId, secretAccessKey);

  try {
    const data = await ec2.describeInstances().promise();
    return data.Reservations.reduce((acc, reservation) => {
      return acc.concat(reservation.Instances);
    }, []);
  } catch (error) {
    console.error('Error fetching instances:', error);
    throw error;
  }
};

export const startInstance = async (instanceId, region, accessKeyId, secretAccessKey) => {
  const ec2 = getEc2Instance(region, accessKeyId, secretAccessKey);

  try {
    await ec2.startInstances({ InstanceIds: [instanceId] }).promise();
  } catch (error) {
    console.error('Error starting instance:', error);
    throw error;
  }
};

export const stopInstance = async (instanceId, region, accessKeyId, secretAccessKey) => {
  const ec2 = getEc2Instance(region, accessKeyId, secretAccessKey);

  try {
    await ec2.stopInstances({ InstanceIds: [instanceId] }).promise();
  } catch (error) {
    console.error('Error stopping instance:', error);
    throw error;
  }
};
