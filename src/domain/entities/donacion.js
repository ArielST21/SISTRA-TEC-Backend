const {
  ESTADOS_DONACION,
  esEstadoValido,
  esTransicionValida,
  esEstadoFinal,
} = require('./estado-donacion');

class Donacion {
  constructor({
    id,
    donorId,
    donationTypeId,
    collectionCenterId,
    trackingId,
    descripcion,
    pickupAddress = null,
    estimatedDeliveryDate = null,
    deliveredAt = null,
    status = ESTADOS_DONACION.RECIBIDO,
    createdAt = null,
  }) {
    if (!donorId) throw new Error('Donacion: donorId es obligatorio');
    if (!donationTypeId) throw new Error('Donacion: donationTypeId es obligatorio');
    if (!collectionCenterId) throw new Error('Donacion: collectionCenterId es obligatorio');
    if (!descripcion) throw new Error('Donacion: descripcion es obligatoria');
    if (!esEstadoValido(status)) throw new Error(`Donacion: status inválido (${status})`);

    this.id = id;
    this.donorId = donorId;
    this.donationTypeId = donationTypeId;
    this.collectionCenterId = collectionCenterId;
    this.trackingId = trackingId;
    this.descripcion = descripcion;
    this.pickupAddress = pickupAddress;
    this.estimatedDeliveryDate = estimatedDeliveryDate;
    this.deliveredAt = deliveredAt;
    this.status = status;
    this.createdAt = createdAt;
  }

  estaBloqueada() {
    return esEstadoFinal(this.status);
  }

  puedeTransicionarA(nuevoEstado) {
    return esTransicionValida(this.status, nuevoEstado);
  }

  puedeCancelarse() {
    return this.status === ESTADOS_DONACION.RECIBIDO;
  }
}

module.exports = Donacion;
