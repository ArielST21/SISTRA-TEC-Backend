const { esRolValido } = require('./rol-usuario');

class Usuario {
  constructor({
    id,
    fullName,
    email,
    passwordHash,
    role,
    address,
    phone = null,
    vehicle = null,
    collectionCenterId = null,
    isActive = true,
    createdAt = null,
  }) {
    if (!email || typeof email !== 'string') {
      throw new Error('Usuario: email es obligatorio');
    }
    if (!fullName || typeof fullName !== 'string') {
      throw new Error('Usuario: fullName es obligatorio');
    }
    if (!esRolValido(role)) {
      throw new Error(`Usuario: role inválido (${role})`);
    }
    if (!address || typeof address !== 'string') {
      throw new Error('Usuario: address es obligatorio');
    }

    this.id = id;
    this.fullName = fullName;
    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.role = role;
    this.address = address;
    this.phone = phone;
    this.vehicle = vehicle;
    this.collectionCenterId = collectionCenterId;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  esDonante() {
    return this.role === 'donor';
  }

  esTransportista() {
    return this.role === 'transporter';
  }

  esAdministrador() {
    return this.role === 'admin';
  }

  aJson() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      role: this.role,
      address: this.address,
      phone: this.phone,
      vehicle: this.vehicle,
      collectionCenterId: this.collectionCenterId,
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Usuario;
