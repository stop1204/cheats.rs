//
// This fils is called (implicitly via npm) from `deploy.sh` and does one last pass over the
// generated `index.html`. It inlines some resources the upstream tool misses.
//

const fs = require("fs");

// These here are not replaced by "inline assets", so we do this manually.
const REPLACEMENTS = {
    "url(magic.png)": "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAB3bSURBVHhe7Z3LjyTHccZ3ergP2SDgI6ldUgtob3ukIVuGLNuACfIiWPpLTYEXGz5IMAX5JR55WxHLfZC8GoSt3dVsj/LLzpyt7umuysiIyMpH/IDRPLScrsqML+LLyKyeG4ZhGIZhGIZhGIZhGIZhGIahxln4bHTG40e/vwxfeu4/+KHNdYfYpDYAxHjr1i3/9dnZ/pTtqXTC7fDvIy9fvQpf7XMYAJeXu9/4yv17E3392ARVxJVQnUgxMVGch2IsRRT91bU4cZuw68ImYiUg1tu3b+9V0LWESmUqbPDy5UsT9UrYoBfi22fPL7fbra+uoBWxpgJR485gwa1Kl8MGWZGvnzy9xJoVVbY3wS7hqzTW0+7+v//ePYszJWxghfnm6bPdctF9jCbaU8TqDN41MYtigykAROu7t67amGjnietnVOfvv/+exR8TG8BMTLR8os3GMsMqcx42aES+DhbZRCsLGl/AhEzDBisBvz97+7b/2oSrS1wv29ZUGjZAM3zz7PklLF48BWWUBSI2ez2PDcwRsP1ja9t6iI0v2466jg3IhHjYAiekjPqI9toq8htsIBxeuM4qW8VtAzS8bI28Y/gBgF1uteJe7akegEn1W1yHuGWB/+Q+pv9vq4kLIh59L3nYm8d2EG6+5gbVlUDDfnOcLAQukKpA8dnhmMj8NzEBVN4LGN1WD3fTvkHlqK3qerEGoeJzTQ8ETB9zjMKudfxGq8hD3WxNdjlWUdDi0ztXonZgq6cWJwMhj9StHuJGa7HLECrWpj3ubdZ0tHSk/ePub3DtqhvXsa8G6ppOLfeaYh6hydXtza15GCM2VhBAo291QMxIoFg5rzUXPa+Nu7ypNapuDBRgj8kdZ81npXtdG/d2Q2dOvNuS4o3V1k4H0fBrZve5pJCDiDfuy12m7YBugu75V08uN5tNsUaVCVeG0kud3uati5soaZkRACPuN2qDOSy5HdVLg6v5G8AWUYnsDeFebrc37v7gfROuIiWtNbb1Wq/ELV/8mRPvVnuizSqvQ9xX1nZWQcTNrotx4c3x8OHDW75ZpSheCNfbLCdcE295MOawuBCYX7YoAcuOQoCYCj9qiuYCs4TFQsDYw+N1od3naNVpNXWxEK9mk8NPIo7g3btr4q0QzD8+a8ZAa+viZi5UMwNHi2ZVtw2018ctibiJi9QWrxPuW+7L17ufGI1w7tauF1pLqVaWUdU3sbTF++HHH+GXm3jb47UT2E00GjVAYoiWvWaqzjDaa17g173us3Wa2wKJvcQJrtrtdLUXpiVeTMixLvYIj571wrHYiH0MDUHXHBtVWmicrtISL7LpsZmATcfrtmCbRgVV92Rix/FWN7dRyJL42EDFr5DqBIwJks6imNQUK4TXRXBAyOFHRiXEXsipxI7tPwARY66lhYzXrjG5V2ULTmZXBphIN6nn7svt7ic7INK5RHHqvzOKs/iI6AmLu3Hx9Fo6nmpbE1dTgT/44IOb0uktiBCDTRYhxO1E/rrGrDsKwTIvP999dFF0YwuhaXSpHzx4oLMtkkEtmUT8wYSlTLlUgafUlnVHgDI/k0R9lGi/pQivh+K3enKvogKXFi/AhGMiUojr4poyb6/AiUmKF8BeS1ZiXBtiNny7KqtXFcpkpUCpltTXRrDgF1s11gHzgc+UOdGc7yVqcGarVmCsLyUHFFmWMqDUkce1ohrbulieKC5qPPj3ok6E4rpS8M5s5e2l1bIHRCDZIczNhrlZGclilDcP1wTvZXa22ZCFC1Ls8zFqiT0J1qrAZ5Jpi1p5p+SOetyTtGqcD8buzp07WeL1EKrvFMQKRCdFuIpxBOz39YQyICaCc8yNqz5vo3YirqIh2AjY2+VXwePbR0lIihix7GJglaZW8awhaV+krIvENVmDKw2/ZnTC4ybwXPt8iGQ8wgmWPjNdtGqIZN0AJlBKLBIeGAGJezNLfRrfb3BLDyn3JYFoJXb3VrqpVdb2MSzPFKnsG5FMmVHE3zx7bkIOYP88t1l4Csk5g4jF9omFYjyVYq+GzCRxGkZavBHpAANrWKraCP0B0aqrFgNSMVpw3otU4GiduISJwwMGTbCGpaoJOBEIVzoxainDie4cMcYF815qKVVEwFIDHn6PTrcvc0tiiTiZI62NsbeLpC3V7ziEcniDyFYqVktNtrqApRpXnL3eFCT3BQ/B/eMj2smeQaJi7e0moDlXUk0t3H+J+VYTBPDWWWAipbaLlpBaA80RlgE9vgtmkT/tqrX+PUQqdrXXw7oVWMDqaFfePQp0EENmvujJUiPxuXsq8neZywSC4Llp5ZhSE7DPYAUmVJJXLlmUACLuxVLHeZaoVikgoRdDoABhXDSTtZqAJfIOrHPJbZj7D36o8qZop4iT26KQ79+/f8eLt5BwAeYGcxS+VQexJxEPmpOrImCJxhUGrph1nlD6BTFO2llaGgj3t5/95g8lxevR6z6fRMJKY5y0krS4gB8/+j3bOvuF/67RU5yiFm1CK5baN/pC0imNZvd5DheL7P1hjNe3CqfzxAV8S2DdG94idJUubY6NlgosTDIqcY3VOFp9qb4GNVHi35e0zweI7A9vt/JHGEQFjEnmZua1rPMeRKuGf40AkxAyKrGvxq7ShR+tDuY1Wn0umF8/TtTubOEzxodI7A8j+UmfkRcVsMQJmfgG3WtCnih332h4uEneSFlwTHaw1GseHd1I9DMiEC/saE6CLrVDoI30KTIxtfi1EXftu5vg9RXsoN7P9NolxiISk0lpV4Kqi1CTWuvujQ/RqVUVF0IuU+p+5Cows3LWNEke6v1MMqvffpC21LtqXAS8lrRlns4tdZLrCYrQlWa6Acn7ERGwxNq3pkkCZMt2IPhgqUXftiU2ksKPxJHe20WgI+AP3QP1BqSWJWIwixWSo9RaWEQ3XMtYXfUNUIMZYj1mdTE+mHQpYZx6HQ6S14j5xMWdGovcpUlNxMZeLlL3xa7AEvu+1c1OQOq6UI3dZN3EpEngLTUEJ4R3UG4OpcT74ccf3T6ZYBhLk57AWEM74dts2ALm7vtiwqWriRTUjvjCbFwg40qJGIKDQ4D4wo/IREvOqSRT4lr3iy++kLlJx2YjulEiBmKWO5fcwgfYo8NVXpXKDbxz7y5pkpBVlyqjF7Fb00ms6/B6udU4WkCpqpti63OWJJiD8G11cC+MXX4dLAFLrANqrb5XUC1cQtX2lvr998T3jPGHwcKP5jiXrLqYQ5eUsvZ2l5AIcE1wz0gyuSCZcRwUYAmYPcANrG/IB0vS7+kybjdJgGD49JNfvpqrxhCu+7iQqLogWmb3pcrbHNWd2XdwD2ZwFZA9Ruzq6wIXARy+rRpq5zTFTk7B70eiEK6Ke69PvYc58Pvxyyn3SI2XY/dQK9SlwSHUeJmSXYG5maeGI5PJUJtZxLFBIuPasSnRmkG0/jMCTEq8SLzuWnMDLpWGomPVtXC+hWYIsIm17xRqssocmyhiCSGj2kG0/jOjOkTideW6JmqQSp8Z1gTzhpjOhnGvWQJGVmcFRUOTA/xalTBBGJu5tegcCAb3IbZnLAGu5R/n9nYX8PadEC94vVaWVxHOxfomZGa8ZAmYkx1bnBxAvWDmEsHvGUtZag7RMrP2dqlj0ViCB+wqnBkveRaaEZyssG4IiRD0QeEEtEY1xmtyLPMeREE21R9ZGbKAufa5vdy6g5phMUYYq/BtNhCQq4Bie8YpeJcktLfr44XQQMN9SrzuKjCcQ2685DexMgiBMUx6FUxWuz1jQgLJxVfd3RyJ7O2Sl1sNV18/R4xEm7M0JQuYFZQNrm04SIcihAWBaQjZ/16N6jfA+ncKy/5n/LckAXPtcw1NGQ4QEEU82MKRfidCCOwv/+pHfy4pYswLLlK6uYh77737fAinAufYaJKAOZGIyVnxXQVXQ/qdCLHd8Lv/+u//4yTSQ+JescSafQrVEvYQHNw/DkCdAJKAOQPcjXJXXNPFhpCkeKdAyGE/UuSiRbNBSxRcBiQLGHYIE5xLyS6qJtRmEsTGfXA7PIQg9gTRHP5QwdNn29yDBRH/Rg+E68WYNtt9PoCzVKTGS7KAOVYQN9STfabeCGUb5ZDYd9Cqusfwr8c4HQTIb/TQUYOTa6MpY5duoRlWsJ+p2UG9n8z7f6tU1T1FqMapzxnvs+JSowZYd0MYO9IaOJe+pobejabaomCZ/1iy6p4C1/DpP3/yitLg8vaZUEUwliOdD5AkScDU9cyUntY2HFJtEcTrLayAeDH2HCsXgRjhBFJFvKZrqAXEfO7YY7xTE36SgCnZ9BodrW2mUDPS0r+/d+/e96J4JYhVzbsFoQZiFPHi2phoh3vN7pz7Sk2CSQJmSbCztU2EmmExIaeyKgTxP//xn/8vUnWdWNE0nFrS2DmXqMa4j7g2Dj/ag+rWcE3m0PJRXwP38kepJDiSVc8g3mhRuUAMP/vFz28dE0SoxmLPGUOkQcR7MUR1az0rt8SxSlUBI1i6Pn3F6LQi+N3HlrU8mYDKC5F+/vnnfww/Ooboc8ZBxK+nlpo4Im4Iqf9FO1DfljiHRQFzGli9QxUCxhHjKbm3iwDx4iWcIY72XyK4/H3AUjsR58SKVDKpldzqFWMlfHuSRQFLWLte8Rv2xCWClF0GEKCrqJucBwCCpd5IVQjcF9VNYOy6dmgOjr9I2blYttAcH9+xPbqCOD5S4p00qjiDfInfASFJCJl6b0O88wZDAymjsyhgzhD3bo9A6SYdxhSCk+zcooL/6Md//WdS1TgVqntpEY4GUqS/GASxS0ol2LsBUuybwxfalBjT3PmmYvGxTMoY6VroQdAeIW9x3UeJgJfcM55lhOVVAWYFzOpADzRBmlYQQsLebk6jKhckCveh+t7UIyyvuKR0omcFzGq4DFS5uY+PnSJW3YW9XS12f89YITlBvL13n/dgFLOlTvSsgDldwnFmRx4kAwR5yap7ClyDb5wJJigzzwQWxL+8BjaW8M/tSjWxQtXd1HQ+GNeCaixlezFWGLOHDx/qd/4qQHO7TE3AmuvCWkDH1gWi2HO7k6pbZZHyJ7jcvEpUY4zZv/3Lv76kPGfcKhwtLIl/VsBmdU7jj0O69YmEeL1FdZNcU9U9BRLM3/ztT74nJWL0WaZnqQ0aswGjuX/VKgg2ZEWx45CwzBWsdXOQ3DOOVarVsVgiW0sL8aFiobucAUcMWCnxgiGOEybg3Yz7GMFSS2JNrDSunts1JigkH2+pdyK22ExAZZB6SqEQrvsQe273ECs314HVdCJ+bdXYwWli5dKLKfTrlmDttPDB6pJE+LYZctd0qeB3oxr3ImItTcwLOPMESQcjLrq3u4itg08SLXXre8ZampgXcG5gNXwO2lvm0u/JPNC58RwwF83vGSvN8UkBcx5kaLWzKrm3SwGv2VJw+nEqPUbu9Zq21JmawH3PPdBgTSwHqi4CQ2p7CPvg1IMOPb+5m+RZ6mipmxWyMCoCbgmIFxVQQrwIVH8cEodYqIJsyLVQlYPkFM9S44NLrMYQcvjRsKgIuJFQFN3bRYV59717b8XjkDg9Q6k6CMoWutF+zAjJDmMQTxJhbNzHOeds8BQ/ZjsRD1uITt445xnX2u1gsMzi78nsvny9+8kOaiJrondAvcbrsbCFoCUqMQgirn7POHdmocG5Z6dnM1d2OFUciMjYUpYZg+sts9D53erLLyAm51NJCdX4xYsXImvjaKlrFrHWhc0KOPdFa5Qv/satF6+AcEGsutEyHwP/HyVAcW01ByGujeJaMEZz43P3B++LPmcc18UPHjzQO3lTGSprh9oiEJP66Se/fCUlXlLVJVasatXrIC+NEp1YTHRS1fizX/36RQv9BAl0LHRF+KrhJlVCvBAugmyuqlyDuJyoesz569+ToBJLPWeMSgynMIKIVSx0DTz/6glOVInu7UK4oVmVDP49JShxvd8+e17d0OOaKEkQ90ztDTx+/PgFdbzmgIiRwGtelnDpsgIj8965c0ek6mId5y0zUbgctttt+KoeqPaZM1hexG7cpapxXBuHH7XFwrirrIEhnJS/rKaA+N6uqyJXe7vZKK0dS1J6MlG9nZA3ELIEiMkg4vPdT8rBen/1BVQEvAYQrpsgub3dN1V3b283BwQjpZqsmACPQg1A3Cs76e24xNhJdamDiC9astRLZwPUBCwlpBSQWfF6ElkOwaJhmam/rOT4LZHyZy73oDqOBZAMpPeMS1pqzlwuLV2arsDY7/PiFRAuiPuWQtVjD2q0VFUiKlgCSO8ZI2ZQiUsIWfNk4qyAOS+sPSoY+H//1a9fSIqX2jWl4BszhODDfdVgo719JlSQydJDBSRXvIZENUYljkIOP6oPjoVmZTvFrIMBx8BLiPfKMiuKNxeydVUAQV4bSBA//Ye/vyMhYuAtteaeMcORLP396VkBs/5ol4KNkt7bhXC1LPMxyC+imASTIc5jkYF0PHr06CXV1cwBl4HCUFM1xr0t/RG4ZtbAGFixvV03MFG84UdFiPYvFQTVmjZ6xe5zMl7EA+8ZLwo4dzYw8ULB5/d2paouJtpN+nnpQMtF6r5zoHZP1xrQmveMqUmQyqKAOQrkBp/i3u56R50q6OimQp17zW5rAn7PWFTET56y94xZsZswnovRARHlXsREMGSQAaUyFyYVG+JSk8vl7bffDl+l8d1334WvytLKdR5y8+bNG2ebjchyC3CWW5w4TtHP4kXBAlAnMgLBULu79+/fv/Pbz37zB03bYRhUICYEMlXIHAEjIS41sZIuJvciqBUYr4PPJl6jVqjVOFc7qa+j2oXGhac+Gie5t2sYWvgudeKeMfURzCmpC+8kASenmyMsPRoH4SJLrdltNQwK6AkhZpcaXKymXuJ/u+o+MAYAwrWqa7QGYnapGjPkm0ySgBW6t+dWdY0eQDUOlVj0OWOsgVNQX4yD6YIcvwefreoaPYGGLWxv3HXh6IXS/E220Jx1cFwLxJsy8Rq94eM6rI3xPUcvqetfkCxg1oL87IyVkQyjFRDjsNRcvaSSLOBUT34Mq7rGSPjGLOMI5dIjhFNIlT52jQ3D0IF6+IkkYO7C3DgOdUy1xrKW62geZ59zKzD1pFfRCpxytnNEqImROskpUB9aoVaKUeA8OwCoc0s6yIFfzMm6nHVBz1ShAupji5wmTcdw3gYJ2qImZpKAASfYbMpPQBRPDeO42ZBDZwwKJ7aiswCbGPfJjDe8e+8u7a12hMcxx8K/4645fGsEOM/Og5wBJQuYa6Nt1k/QkCW1DHwC6jJkQo59BsV9kE3+CRpag1oSrocsAXMmEFYtHP42JqCjS3loBFZNYhzxOyj2ObdS9A51HK+RmZCzBMy10abeE1CbWStUYVOuPNBS7h8WyLfQjOCxKnwC6pgy1lwR6iSskTRqB7G81gnFbAEv/dnDJSwMruPfFpXgbJAIU9/e5Ri+a0q0z7mVome4scwZ0GwBc200N/h6hTqZrETaUOOsVrhrX+6punwL7eBkDkOGkpLiuq4e4Y4/d0nCnhHu5rXGud7WKXE2mrpuy3mP797hrn39koQZ+6wKDGwtrAAxK+eMITnzW/W9BruhJ7AkYQuY+4Z3qDTWkT6gxNrU1r8s/NqX6Tydo2Hrj/0LWH9DOGBbE/v4Qx2EMUUgpb6BPqC+4bh1n6/Djdjw37MDny1gwJ1ZBKA95MBj6Q30p1ATpil3H+r22zGkGoIiAuZuKRlHoLoSQkBYpmTCFB+WnXgCLXzLQkTAgHs1yGi2L/yGnEMdKX9QnfoHp3ENtkvwBu6+L5DcjhMTsEQVljqg3wvUaU5pqpDfMcL6E1dwt42AdEIUEzCQyCzW0HoDdSyS/rWiNe8diciUPgwjKmD4erTHOVgVfoO0jfb2mVCB8dr2xnU7JKyz5No3Iipg4OzBTa6IA6J/LGoU5izyWk/MdMC5REUR0sUe4gJ2XHBtMALt6ydPL8K3Q0NO13NjT7RvVnp3IBbZ1deJV+MtlTUETLZ+xzArvYPaHMS4HbPR1n3Og3vWH2guRVQEDCSuNlTi4UVM5ZhVpgahVV8Z8QLNsVQTsMS2kse6oCKdY2oWtN0Ah0DsaTsZNQFLAds3upWmNj8Ou9FU+ww0Gi4t4asvccyOopwIVQUM3y8RCN5KDyxiND/IIp5YP+rhDVSNkf+Gld8yErDOfu2r/BCIegX2Vpr5yCEYvRJTb3zv3xOrwLDKdSDGJLbbNBtXU4pYaKnTJyEMq7f9GlD+6DOINtrbZ2oFFki4jSJ29qBUEiyWbKU6erCSo25vUN9qJwqRMu6lKkeNUMf3FCXHsFg1k9gbBiOvh6kR4Z0P0f0MqVyHVNMKSbNkAixrR4U6chjoEUVMtbY5AzSifZZqWq1B8YQrZaXBiHZayuYdw8aTh6++yl3nQ4o3hKSsNICdHq4zrbivOJqlERUv1r2FxQtW6ei6NcJGYn8Y+DWxq+rh2+6RGrdjUDvdLeNts6R4XUyHb4uyyos6RAUHSz5KJfbvAqogNAThKIc3pPZ6r9i5olXiby0B7w54CFaToey00L76lFEWvrDNkuJdY907ZTUBA7TbJS2ht9MDiFjD6o7QfZZuACJ21xQvqCLxSg9sWJN0XVTEGzC9j5fg7geopWO/agWOoAEgaacR2L1XYtHIUX5iZm18shMUL2K1lu22KgTsuPzZz//plomYgOA6eLOpJQzkkTphFcFS48OPP6rm1EdVtkm8O+gITQYcUk//2yONIGGja7GCCpy78WG/l9UUFJif/N1P/+LLL7/83/Cj1akq9SKQpPc5YZ3cRL7uskMtYH17tCiYa/chKl6ALFeTeEF13kl6ewlgIn2HurcDHwI2urfSG12chpOr0alUO38adhogOfTUceWMU29jId1pjqy91ztHtd0LDTsNUI2xduylGnNuohflYi59P0BBvDXs9c5RdfvR22mFAwYQcVgbty9ixjq4h3eejFVXer0LWmjwVb9/gOwnvSaOxGrsvmz2z7jkjo+3zxVXlgTOtSwzwPjULl5QvYAB1mkalRgEEV+0bKmzoqzh6ot1v5uvCy3xetvcgHhBUxlYq7EViWvuFjLvlJxxacEeHoL7RNrRsMsAVRcD0tK4NDWBQHsSQc1dx1P4Jk7imLQqXs3kDfHWdkgjhSYs9BQEnrM3N7UsNYgNrqZsNcESt2Se/TwUEC+O8rYmXtBcBZ5w5iZ2q1mJQSu2mlKBW3AYuB98LjG/rbmRKS0L2KNtrSItrI9SurK4j5obNH6J5NyEVoNqSuviBc1Z6EMwAZp2OoJKgESBAKvWWiccraw1Wp9/9eTKKpcQL2KmdfGC5m8gAlHhjcxLVGOASgZqqmYpFbi2quOToZs3bascacFJUehGwIEi6+IpyORIHLUExNxauCb7XNIqR8L9w3W21MebpTcBe1IqkTS+IodO8JoNormewNrNK1wbPuN/SiZZ0ELjLocuBQxKW7MpsSrjc+m3ap1LXmtUYPx1RP/3iQtX2wiWDKj0PYoXdCvgyBrVeEqszAikUmI+ZqNLViAvWrz+Sgk0UtOSQYvuBQzWWG8d48pmu8DWDKxjSUs7mJE08MvXsMeH4F5xLb00qubo/ganzDV4ShODDMBuv3PvrthcHFsHS3efv3323CdFUINoIz3s7VIYSsAAIsbnWgIuEgXtL07Ack+TFbf6xr/yD8Ei2dQk2AjuEfRumQ8ZTsARb6vd59oCccq0Svtq58SD77GeBXMCnwp4qSpBoPgcRepxrxVpYYxGqrpThrzpKTXZaiqx6hyCSYUQ4zo4dsWDNK/R4v0jKYFRhRsZXsAgdk3XbnIZaYSO+k335cXuJ+NiAp6Axsx2uzUhV8rodvkYNhBHiCeGSp2rNuaJSwAT7nVsQGaIWyUm5HUw4S5jA5PA1XFAR6sNr1aIjTn8DeTSx1BbxAaISK37yK1jXeU8bLAyicczgTW98ojVFkFows3DBk0AX5XDQQurzMtYN1kOG0BhriqzifkKX2ndmKAhhcaUrW3lsIFUBE8FIWjBaJ3sqWit0uphA1uIq052p9XZquw62CCvRDy+6QlVuhVRx+aTT0YO7pNTRj426BURqzQmZSeNHWsJ+0qojnhNtj9bFzYRDQBhx0f94poaxG0s/GwqeHAo+qkYgRfk5L+PxNcwG9wGNkGdAtGHLz0mRsMwDMMwDMMwDMMwDMMwDMMwKNy48SdbIYKAiVqcdQAAAABJRU5ErkJggg==)",
}

let content = fs.readFileSync("index.html").toString("utf8");

for (let key in REPLACEMENTS) {
    let value = REPLACEMENTS[key];

    content = content.replace(key, value);
}

fs.writeFileSync("index.html", content)




