kubectl delete deployment dbproxy
kubectl delete svc db-service
kubectl run dbproxy --replicas=2 --labels="run=load-balancer-example" --image=jw2473/dbproxy:second --port=8888
kubectl expose deployment dbproxy --type=LoadBalancer --name=db-service
kubectl describe services db-service
