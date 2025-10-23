export class Combat {
    public takeDamage(user: object, target: object) {
        user.currentHealth -= target.attackPoints;
    }

    public performAttack(user: object, target: object) {
        target.currentHealth -= user.damagePoints;
    }
}