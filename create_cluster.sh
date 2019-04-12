bucket_name=my-bucket-jw2473
aws s3api create-bucket --bucket ${bucket_name}
aws s3api put-bucket-versioning --bucket ${bucket_name} --versioning-configuration Status=Enabled

export KOPS_CLUSTER_NAME=my-cluster.k8s.local
export KOPS_STATE_STORE=s3://${bucket_name}
export AWS_ACCESS_KEY=AKIA5B52HJDE2TUVKZKB
export AWS_SECRET_KEY=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

curl -LO https://github.com/kubernetes/kops/releases/download/$(curl -s https://api.github.com/repos/kubernetes/kops/releases/latest | grep tag_name | cut -d '"' -f 4)/kops-linux-amd64
chmod +x kops-linux-amd64
sudo mv kops-linux-amd64 /usr/local/bin/kops

ssh-keygen -q -t rsa -N '' -f id_rsa|echo -e 'y\n' > /dev/null

kops create cluster --node-count=2 --node-size=t2.medium --zones=us-east-1c --vpc=vpc-e5b10b9f --ssh-public-key id_rsa.pub --name=${KOPS_CLUSTER_NAME}
kops update cluster --name ${KOPS_CLUSTER_NAME} --yes

sleep 10s
kops validate cluster

kubectl get nodes
