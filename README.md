## Kubernetes cluster cost metrics

Bumper is a pragmatic HTTP [API] to retrieve [Korral]'s Prometheus metrics and to proxy [Fiber]'s [Korral](https://github.com/agilestacks/fiber/blob/master/samples/korral.yaml) custom resources.

### API

`POST /clusters` creates a Cluster custom resource for [Fiber].

```json
{
    "meta": {
        "name": "My Cluster",
        "domain": "test.bubble.superhub.io",
        "description": "optional"
    },
    "kubernetes": {
        "api": {
            "endpoint": "https://api.test.bubble.superhub.io/",
            "caCert": "-----BEGIN CERTIFICATE...",
            "token": "<bearer token>",
            "clientCert": "-----BEGIN CERTIFICATE...",
            "clientKey": "-----BEGIN RSA PRIVATE KEY..."
        }
    }
}
```

API responds with HTTP 201 Created `Location: /api/v1/clusters/eda4ac2b-fc4e-4ca5-ac52-1fb709247040` where the uuid is uid of custom resource.
Either `token` or `clientCert` / `clientKey` pair must be specified with permissions enough to [install](https://github.com/agilestacks/korral/blob/master/install/kubernetes.yaml) Korral. Fiber repo host a [sample](https://github.com/agilestacks/fiber/blob/master/install/korral-installer-serviceaccount.yaml).

`GET / clusters` list all available clusters by enumerating Korral custom resources. `GET /cluster/<uuid>` returns specific cluster, `DELETE` to delete, and `PATCH` to change fields. Additionally to the structure above, `status` is returned:

```json
{
    "uid": "eda4ac2b-fc4e-4ca5-ac52-1fb709247040",
    "meta": {},
    "kubernetes": {},
    "status": {
        "status": "status from the Fiber operator"
    }
}
```

`GET /cluster/<uuid>/metrics?[options]` returns cluster cost and essential capacity metrics in Prometheus format. UI uses metrics to slice cost by namespace, pod, application, team, etc. Requests sent to `metrics` are tailored to use case and are transformed into Prometheus queries.


[API]: https://agilestacks.github.io/bumper/API.html
[Prometheus]: https://prometheus.io/
[Korral]: https://github.com/agilestacks/korral
[Fiber]: https://github.com/agilestacks/fiber
[Prometheus custom resource]: https://github.com/prometheus-operator/prometheus-operator/blob/master/Documentation/design.md
