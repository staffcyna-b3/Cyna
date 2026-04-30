import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressService } from '../../services/address.service';
import { IAddressRepository } from '../../interfaces/AddressRepository';
import { AddressType } from '../../enum/AddressType';

const makeRepoMock = () => ({
  findAllByUserId: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  clearDefault: vi.fn(),
  countByUserIdAndType: vi.fn(),
}) as unknown as IAddressRepository & Record<string, ReturnType<typeof vi.fn>>;

const userId = 'user-123';
const addressId = 'addr-456';

const makeAddress = (overrides: Record<string, unknown> = {}) => ({
  id: addressId,
  user_id: userId,
  type: AddressType.BILLING,
  address_line1: '12 rue de la Paix',
  address_line2: null,
  city: 'Paris',
  postcode: '75001',
  country: 'France',
  is_default: false,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe('AddressService', () => {
  let repo: ReturnType<typeof makeRepoMock>;
  let service: AddressService;

  beforeEach(() => {
    repo = makeRepoMock();
    service = new AddressService(repo);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('première adresse du type → is_default=true automatique', async () => {
      repo.countByUserIdAndType.mockResolvedValue(0);
      repo.clearDefault.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(makeAddress({ is_default: true }));

      await service.create(userId, {
        type: AddressType.BILLING,
        address_line1: '12 rue de la Paix',
        city: 'Paris',
        postcode: '75001',
        country: 'France',
      });

      expect(repo.clearDefault).toHaveBeenCalledWith(userId, AddressType.BILLING);
      expect(repo.create).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ is_default: true }),
      );
    });

    it('deuxième adresse avec is_default=true → clearDefault appelé', async () => {
      repo.countByUserIdAndType.mockResolvedValue(1);
      repo.clearDefault.mockResolvedValue(undefined);
      repo.create.mockResolvedValue(makeAddress({ is_default: true }));

      await service.create(userId, {
        type: AddressType.BILLING,
        address_line1: '5 av. Montaigne',
        city: 'Paris',
        postcode: '75008',
        country: 'France',
        is_default: true,
      });

      expect(repo.clearDefault).toHaveBeenCalledWith(userId, AddressType.BILLING);
      expect(repo.create).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ is_default: true }),
      );
    });

    it('deuxième adresse sans is_default → clearDefault non appelé, is_default=false', async () => {
      repo.countByUserIdAndType.mockResolvedValue(1);
      repo.create.mockResolvedValue(makeAddress({ is_default: false }));

      await service.create(userId, {
        type: AddressType.BILLING,
        address_line1: '5 av. Montaigne',
        city: 'Paris',
        postcode: '75008',
        country: 'France',
      });

      expect(repo.clearDefault).not.toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ is_default: false }),
      );
    });
  });

  describe('setDefault', () => {
    it('clearDefault appelé avant update', async () => {
      repo.findById.mockResolvedValue(makeAddress());
      repo.clearDefault.mockResolvedValue(undefined);
      repo.update.mockResolvedValue(makeAddress({ is_default: true }));

      await service.setDefault(userId, addressId);

      const clearOrder = repo.clearDefault.mock.invocationCallOrder[0];
      const updateOrder = repo.update.mock.invocationCallOrder[0];
      expect(clearOrder).toBeLessThan(updateOrder);
    });

    it('403 si address.user_id !== userId', async () => {
      repo.findById.mockResolvedValue(makeAddress({ user_id: 'autre-user' }));

      await expect(service.setDefault(userId, addressId)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('404 si adresse inexistante', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.setDefault(userId, addressId)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('delete', () => {
    it('suppression du défaut → promeut la suivante du même type', async () => {
      const nextAddress = makeAddress({ id: 'addr-789', is_default: false });
      repo.findById.mockResolvedValue(makeAddress({ is_default: true }));
      repo.delete.mockResolvedValue(undefined);
      repo.findAllByUserId.mockResolvedValue([nextAddress]);
      repo.update.mockResolvedValue({ ...nextAddress, is_default: true });

      await service.delete(userId, addressId);

      expect(repo.update).toHaveBeenCalledWith('addr-789', { is_default: true });
    });

    it('suppression non-défaut → update non appelé', async () => {
      repo.findById.mockResolvedValue(makeAddress({ is_default: false }));
      repo.delete.mockResolvedValue(undefined);
      repo.findAllByUserId.mockResolvedValue([]);

      await service.delete(userId, addressId);

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('403 si address.user_id !== userId', async () => {
      repo.findById.mockResolvedValue(makeAddress({ user_id: 'autre-user' }));

      await expect(service.delete(userId, addressId)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  describe('update', () => {
    it('is_default=true → clearDefault appelé avant update', async () => {
      repo.findById.mockResolvedValue(makeAddress());
      repo.clearDefault.mockResolvedValue(undefined);
      repo.update.mockResolvedValue(makeAddress({ is_default: true }));

      await service.update(userId, addressId, { is_default: true });

      expect(repo.clearDefault).toHaveBeenCalledWith(userId, AddressType.BILLING);
      const clearOrder = repo.clearDefault.mock.invocationCallOrder[0];
      const updateOrder = repo.update.mock.invocationCallOrder[0];
      expect(clearOrder).toBeLessThan(updateOrder);
    });

    it('403 si address.user_id !== userId', async () => {
      repo.findById.mockResolvedValue(makeAddress({ user_id: 'autre-user' }));

      await expect(service.update(userId, addressId, { city: 'Lyon' })).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });
});
