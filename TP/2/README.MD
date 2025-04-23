# Trabajo Práctico 2

* En [este documento](https://cripto.iua.edu.ar/blockchain/doc/) se describen un conjunto de desafíos criptográficos. Resuelva los siguientes:
    * [Generador de números pseudoaleatorios de Java](https://cripto.iua.edu.ar/blockchain/doc/javarand.html)
    * [DSA con reutilización de `k`](https://cripto.iua.edu.ar/blockchain/doc/dsa.html)
* Suba el código utilizado a la carpeta `TP/2` de su repositorio personal, tal como se describe en el [README](../README.md) del repositorio de la materia.
* Describa la tarea realizada en el archivo `README.md` de la carpeta `TP/2` de su repositorio personal.

---


# Generador de números pseudoaleatorios de Java

El script [LCG_crack.py](./LCG_crack.py) implementa un ataque al generador de números pseudoaleatorios de Java (LCG - Linear Congruential Generator). El objetivo es predecir números futuros generados por el LCG a partir de una secuencia de números observados.

## Pasos del proceso

1. **Obtención de números pseudoaleatorios**
   - La función `get_number()` obtiene un número aleatorio de 32 bits con signo generado por el servidor.
   - Este número se ajusta para manejar correctamente la representación de números negativos en Python.

2. **Reconstrucción del seed del LCG**
   - La función `reverse_seed(n1, n2)` toma dos números consecutivos (`n1` y `n2`) y reconstruye el seed del generador LCG.
   - Se exploran los 16 bits menos significativos desconocidos para encontrar el seed correcto.

3. **Predicción de números futuros**
   - La función `predict_next_number(seed)` utiliza el seed reconstruido para predecir el siguiente número en la secuencia.
   - El cálculo se basa en la fórmula del LCG:  
     \[
     \text{next\_seed} = (\text{seed} \times \text{MULTIPLIER} + \text{INCREMENT}) \mod \text{MODULUS}
     \]

4. **Envío de la predicción al servidor**
   - La función `send_prediction(predicted_number)` envía el número predicho al servidor para su validación.
   - El servidor responde con un código de estado y un mensaje indicando si la predicción fue correcta.

---

# DSA con reutilización de `k`

El script [DSA_crack.py](./DSA_crack.py) explota la reutilización del valor `k` en el algoritmo DSA (Digital Signature Algorithm) para recuperar la clave privada `x`.

## Pasos del proceso

1. **Obtención de la clave pública**
   - La función `get_public_key()` obtiene los parámetros públicos (`p`, `q`, `g`, `y`) del servidor.

2. **Obtención de firmas**
   - La función `get_signature(message)` obtiene la firma (`r`, `s`) de un mensaje dado desde el servidor.

3. **Detección de reutilización de `k`**
   - Si dos firmas tienen el mismo valor de `r`, se detecta la reutilización de `k`.
   - Esto permite explotar la vulnerabilidad del algoritmo DSA.

4. **Cálculo de la clave privada `x`**
   - La función `calculate_private_key(m1, s1, m2, s2, r, q)` calcula la clave privada `x` utilizando las firmas con el mismo `r`.
   - El cálculo se basa en las siguientes fórmulas:
     \[
     k = (H(m_1) - H(m_2))(s_1 - s_2)^{-1} \mod q
     \]
     \[
     x = r^{-1}(k \cdot s_1 - H(m_1)) \mod q
     \]

5. **Envío de la clave privada al servidor**
   - La función `send_private_key(x)` envía la clave privada calculada al servidor para su verificación.
   - El servidor responde con un mensaje indicando si la clave privada es correcta.
