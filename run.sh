counter=1
while [ $counter -le 10  ]
do
    copilot svc package --output-dir infra/
    ((counter++))
done

